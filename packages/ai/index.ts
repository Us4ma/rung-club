import {deck,winning,play,view,seeded,legal as legalCards,canReveal,reveal,type State,type View,type Card,type Play,type Suit} from '../core/index.ts';
export type Skill='beginner'|'intermediate'|'advanced';
export type PlayingStyle='balanced'|'conservative'|'attacking'|'partnership';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const partner=(a:number,b:number)=>a%2===b%2;

/** All inference is built from this seat's View: never the authoritative hidden hands. */
function knowledge(v:View,seat:number){
 const known=new Set([...v.hand,...v.history.flat().map(p=>p.card),...v.trick.map(p=>p.card),...(v.indicator?[v.indicator]:[])].map(c=>c.id));
 const unseen=deck().filter(c=>!known.has(c.id));
 const voids=Array.from({length:4},()=>new Set<Suit>());
 for(const trick of [...v.history,v.trick]){
  if(!trick.length)continue;
  for(const p of trick)if(p.card.suit!==trick[0].card.suit)voids[p.seat].add(trick[0].card.suit);
 }
 // A revealed sealed card can restore a suit to the caller's hand.
 // Avoid treating earlier void evidence for that caller as certainty.
 if(v.mode==='band'&&v.revealed)voids[v.caller].clear();
 const holding=(other:number,cards:Card[])=>{
  let none=1;
  for(const c of cards){
   if(voids[other].has(c.suit))continue;
   const possible=[0,1,2,3].filter(s=>s!==seat&&!voids[s].has(c.suit)&&v.counts[s]>0);
   const total=possible.reduce((n,s)=>n+v.counts[s],0);
   none*=1-(total?v.counts[other]/total:0);
  }
  return clamp(1-none);
 };
 const reliability=(play:Play,led:Suit,opponents:number[])=>{
  let safe=1;
  for(const other of opponents){
   if(!v.counts[other])continue;
   let beat=0;
   if(play.trump){
    beat=holding(other,unseen.filter(c=>c.suit===play.card.suit&&c.rank>play.effective));
    // When the lead is not trump, a player still holding that suit cannot cut.
    if(led!==play.card.suit&&!voids[other].has(led)){
     const suitChance=holding(other,unseen.filter(c=>c.suit===led));
     beat*=1-suitChance;
    }
   }else{
    if(play.card.suit!==led)return 0;
    beat=holding(other,unseen.filter(c=>c.suit===led&&c.rank>play.effective));
    if(v.revealed&&v.trump&&led!==v.trump){
     const cut=holding(other,unseen.filter(c=>c.suit===v.trump));
     const voidChance=voids[other].has(led)?1:1-holding(other,unseen.filter(c=>c.suit===led));
     beat=1-(1-beat)*(1-cut*voidChance);
    }
   }
   safe*=1-clamp(beat);
  }
  return clamp(safe);
 };
 return {reliability,unseen,voids};
}
function asPlay(v:View,seat:number,c:Card,leading:boolean,lastAce=v.lastAce):Play{
 return {seat,card:c,effective:leading&&v.policy.aceChain&&lastAce&&v.senior===seat&&c.rank===14?2:c.rank,
  trump:v.revealed&&c.suit===v.trump,
  bhaag:leading&&v.senior===seat&&v.revealed&&c.rank!==14&&c.suit!==v.trump};
}
function canCollect(v:View,winner:number,lead:Play){
 return v.history.length===12||(v.history.length+1>=v.policy.opening&&v.streakSeat===winner&&v.streak>=1&&
  (v.policy.collectionLead==='any'||lead.bhaag&&lead.seat===winner));
}
export function choose(v:View,seat:number,skill:Skill='intermediate',random=Math.random,style:PlayingStyle='balanced'):string{
 const cards=v.hand.filter(c=>v.legal.includes(c.id));
 if(!cards.length)throw Error('No legal move');
 if(skill==='beginner')return cards[Math.min(cards.length-1,Math.floor(random()*cards.length))].id;
 if(cards.length===1)return cards[0].id;
 const info=knowledge(v,seat),best=winning(v.trick),leading=!best;
 const opponents=[0,1,2,3].filter(s=>!partner(s,seat));
 const remainingSeats=Array.from({length:3-v.trick.length},(_,i)=>(seat-i-1+8)%4);
 const opponentsAfter=remainingSeats.filter(s=>!partner(s,seat));
 const pile=v.pile+1,late=v.hand.length<=3,urgency=v.history.length===12?145:16+pile*2;
 const ourTeam=seat%2,otherTeam=1-ourTeam;
 // A first collection breaks a potential Kot/Goon Kot. Once our team has
 // collected, protecting the opponents' zero keeps the sweep alive.
 const collectionValue=(team:number)=>65+pile*9+
  (v.scores[team]===0&&v.scores[1-team]>0?45:0)+
  (v.scores[team]>0&&v.scores[1-team]===0?20:0);
 const sweepPressure=v.scores[ourTeam]===0&&v.scores[otherTeam]>0?18:0;
 // Bank side-suit control until it can set up the opening collection.
 // Evaluate the whole holding, not just trump strength or the card's printed rank.
 const reserveValue=(c:Card)=>{
  if(v.history.length+2>=v.policy.opening||late||!v.revealed||c.suit===v.trump)return 0;
  const suit=v.hand.filter(x=>x.suit===c.suit).sort((a,b)=>b.rank-a.rank);
  if(suit.length<2||!suit.slice(0,2).some(x=>x.id===c.id))return 0;
  const setup={...v,senior:seat,lastAce:false};
  const first=asPlay(setup,seat,suit[0],true);
  const second=asPlay({...setup,lastAce:suit[0].rank===14},seat,suit[1],true);
  if(v.policy.collectionLead!=='any'&&!second.bhaag)return 0;
  const control=info.reliability(first,c.suit,opponents)*info.reliability(second,c.suit,opponents);
  return control*(skill==='advanced'?48:32);
 };
 const cost=(c:Card)=>{
  const trump=v.revealed&&c.suit===v.trump;
  let value=(c.rank-2)*.65+(c.rank>=11?(c.rank-10)*1.35:0);
  if(trump)value+=7+(c.rank-2)*.45;
  if(style==='conservative'&&trump)value+=4;
  // Preserve a long-suit winner; prefer discarding low cards from a short side suit.
  const length=v.hand.filter(x=>x.suit===c.suit).length;
  if(!trump&&length===1&&c.rank<11)value-=2;
  return value*(late?.55:1)+reserveValue(c);
 };
 const continuation=(played:Card)=>{
  const next={...v,senior:seat,lastAce:played.rank===14};
  let strongest=0;
  for(const c of v.hand){
   if(c.id===played.id)continue;
   const p=asPlay(next,seat,c,true);
   const chance=info.reliability(p,c.suit,opponents);
   // Under eligible-senior rules only a non-Ace, non-trump lead can collect.
   const eligible=v.policy.collectionLead==='any'||p.bhaag;
   strongest=Math.max(strongest,eligible?chance:0);
  }
  return strongest;
 };
 // Planning the next eligible lead is crucial before the opening collection,
 // and whenever control of a growing Double Sar pile is at stake.
 const setupWeight=v.history.length+2>=v.policy.opening
  ?(v.history.length+2===v.policy.opening?115:48+pile*5):12;
 const followThrough=(c:Card,chance:number,collect:boolean)=>{
  if(collect||v.history.length>=12)return 0;
  const run=continuation(c);
  return chance*run*(setupWeight+sweepPressure)*(skill==='advanced'?1:.8);
 };
 const score=(c:Card)=>{
  const p=asPlay(v,seat,c,leading),lead=v.trick[0]??p;
  const winner=winning([...v.trick,p])!;
  const ours=partner(winner.seat,seat);
  let value=-cost(c);
  if(leading){
   const chance=info.reliability(p,c.suit,opponents);
   const collect=canCollect(v,seat,p);
   value+=chance*(urgency+(collect?collectionValue(ourTeam):0));
   value+=followThrough(c,chance,collect);
   if(p.effective===2&&c.rank===14)value-=22;
   // Do not pull our team's remaining trumps without a collection/control reason.
   if(p.trump&&!collect)value-=style==='attacking'?2:6;
  }else if(ours){
   const chance=info.reliability(winner,lead.card.suit,opponentsAfter);
   const collect=canCollect(v,winner.seat,lead);
   value+=chance*(urgency+(collect?collectionValue(ourTeam):0));
   if(winner.seat===seat){
    if(best&&partner(best.seat,seat)){
     const partnerSafe=info.reliability(best,lead.card.suit,opponentsAfter);
     // Overtaking a partner is justified only by meaningful protection of the Sar.
     value-=partnerSafe*(style==='partnership'?48:40);
     // Do not trade a partner's secure Sar (or immediate collection) for
     // our speculative next lead. The partner also retains useful control.
     value-=partnerSafe*followThrough(c,chance,collect);
     if(canCollect(v,best.seat,lead))value-=partnerSafe*collectionValue(ourTeam);
    }
    value+=followThrough(c,chance,collect);
   }else if(style==='partnership')value+=2;
  }else{
   // Blocking an opponent's immediate collection is worth more than an ordinary Sar.
   if(canCollect(v,winner.seat,lead))value-=collectionValue(otherTeam);
  }
  if(style==='attacking'&&winner.seat===seat)value+=4;
  return value;
 };
 // Score once per legal card. Equal-strength decisions conserve the cheaper card.
 const ranked=cards.map(c=>({card:c,value:score(c)})).sort((a,b)=>b.value-a.value||cost(a.card)-cost(b.card)||a.card.id.localeCompare(b.card.id));
 const end=Math.max(...v.counts)<=3;
 // Leads shape the opening collection and the resources left for later Sars.
 // Also compare responses when a large uncollected pile is at risk.
 const strategic=leading||v.history.length>=3&&v.pile>=3;
 if(skill==='advanced'&&(end&&v.revealed||!end&&strategic)){
  const candidates=end?ranked.map(x=>x.card):ranked.slice(0,3).map(x=>x.card);
  if(!end&&leading)for(const suit of ['S','H','D','C']){
   const alternative=ranked.find(x=>x.card.suit===suit)?.card;
   if(alternative&&!candidates.some(c=>c.id===alternative.id))candidates.push(alternative);
  }
  const planned=planContinuations(v,seat,candidates,info,style);
  if(planned)return planned;
 }
 return ranked[0].card.id;
}
/** Compare continuations on public-information-consistent deals, never real hidden hands.
 * Early/middle candidates must beat the heuristic across most sampled worlds.
 * The existing endgame search retains its complete legal candidate set.
 */
function planContinuations(v:View,seat:number,candidates:Card[],info:ReturnType<typeof knowledge>,style:PlayingStyle){
 const end=Math.max(...v.counts)<=3;
 let hash=2166136261;
 for(const c of [...v.hand,...v.history.flat().map(p=>p.card),...v.trick.map(p=>p.card)])for(const char of c.id)hash=Math.imul(hash^char.charCodeAt(0),16777619);
 const random=seeded(hash>>>0),values=new Map(candidates.map(c=>[c.id,0])),better=new Map(candidates.map(c=>[c.id,0]));
 let samples=0;
 for(let attempt=0;attempt<64&&samples<8;attempt++){
  const hands:Card[][]=[[],[],[],[]];hands[seat]=[...v.hand];
  const remaining=info.unseen.map(c=>({card:c,seats:[0,1,2,3].filter(s=>s!==seat&&!info.voids[s].has(c.suit)&&v.counts[s]>0),tie:random()})).sort((a,b)=>a.seats.length-b.seats.length||a.tie-b.tie);
  let valid=true;
  for(const {card,seats} of remaining){
   const count=(s:number)=>v.counts[s]-(v.indicator&&s===v.caller?1:0);
   const available=seats.filter(s=>hands[s].length<count(s));
   const capacity=available.reduce((sum,s)=>sum+count(s)-hands[s].length,0);
   if(!capacity){valid=false;break;}
   let pick=random()*capacity,target=available[available.length-1];
   for(const s of available){pick-=count(s)-hands[s].length;if(pick<0){target=s;break;}}
   hands[target].push(card);
  }
  if(!valid||hands.some((h,s)=>h.length!==v.counts[s]-(v.indicator&&s===v.caller?1:0)))continue;
  // For Band Rung, the caller knows their own sealed card; other seats sample
  // a possible sealed card rather than obtaining the actual hidden trump.
  let indicator=v.indicator;
  if(!v.revealed&&!indicator){indicator=hands[v.caller].splice(Math.floor(random()*hands[v.caller].length),1)[0];}
  // Past deal summaries and opening animations cannot affect this deal's rules.
  // Keep them out of disposable rollouts, especially on long-running tables.
  const state={...v,hands,stock:[[],[],[],[]],indicator,trump:v.trump??indicator?.suit??null,table:undefined,opening:undefined,collections:[]} as State;
  samples++;
  let baselineValue=0;
  for(const [index,candidate] of candidates.entries()){
   let s=play(state,seat,candidate.id);
   while(s.phase==='playing'){
    let next=end?view(s,s.turn):rolloutView(s,s.turn);
    if(next.canReveal){s=reveal(s,s.turn);next=end?view(s,s.turn):rolloutView(s,s.turn);}
    s=play(s,s.turn,end?choose(next,s.turn,'intermediate',random,s.turn%2===seat%2?style:'balanced'):rolloutChoice(next,s.turn));
   }
   const ours=s.scores[seat%2],theirs=s.scores[1-seat%2];
   const value=ours-theirs+(ours>theirs?8:-8)+(ours===13?6:theirs===13?-6:0);
   if(index===0)baselineValue=value;
   if(value>baselineValue)better.set(candidate.id,better.get(candidate.id)!+1);
   values.set(candidate.id,values.get(candidate.id)!+value);
  }
 }
 // Sparse or inconsistent public evidence falls back to the normal heuristic.
 if(samples<4)return null;
 const best=candidates.reduce((best,c)=>values.get(c.id)!>values.get(best.id)!?c:best);
 if(!end&&(better.get(best.id)!<Math.ceil(samples*.625)||values.get(best.id)!-values.get(candidates[0].id)!<samples))return candidates[0].id;
 return best.id;
}
/** Read-only redaction for disposable simulated states; avoids deep-copying twice. */
function rolloutView(s:State,seat:number):View{
 const {hands,stock,indicator,trump,invalidDeal,...rest}=s;
 return {...rest,hand:hands[seat],counts:hands.map((h,i)=>h.length+(indicator&&i===s.caller?1:0)),trump:s.revealed||seat===s.caller?trump:null,indicator:seat===s.caller?indicator:null,legal:legalCards(s,seat).map(c=>c.id),canReveal:canReveal(s,seat)};
}
/** Cheap public-view policy for early/mid-deal counterfactual continuations. */
function rolloutChoice(v:View,seat:number){
 const legal=v.hand.filter(c=>v.legal.includes(c.id));
 const cost=(c:Card)=>c.rank+(v.revealed&&c.suit===v.trump?9:0);
 legal.sort((a,b)=>cost(a)-cost(b)||a.id.localeCompare(b.id));
 const best=winning(v.trick);
 if(best){
  if(partner(best.seat,seat))return legal[0].id;
  const beating=legal.filter(c=>winning([...v.trick,asPlay(v,seat,c,false)])!.seat===seat);
  // Before the opening setup, do not spend an expensive trump on empty control.
  if(v.history.length+2<v.policy.opening&&beating[0]&&cost(beating[0])-cost(legal[0])>9)return legal[0].id;
  return (beating[0]??legal[0]).id;
 }
 const known=new Set([...v.hand,...v.history.flat().map(p=>p.card)].map(c=>c.id));
 const unseen=deck().filter(c=>!known.has(c.id));
 const score=(c:Card)=>{
  const p=asPlay(v,seat,c,true),suit=v.hand.filter(x=>x.suit===c.suit);
  const higher=unseen.filter(x=>x.suit===c.suit&&x.rank>p.effective).length;
  const strength=14-higher*4;
  const eligible=v.policy.collectionLead==='any'||p.bhaag;
  let value=-cost(c)*.5;
  if(v.history.length+2>=v.policy.opening){
   value+=strength*(eligible&&v.streakSeat===seat?4:1.5);
   if(c.rank===14&&suit.some(x=>x.rank===13))value+=10;
  }else{
   if(c.rank>=12&&suit.some(x=>x.id!==c.id&&x.rank>=12))value-=20;
   value+=suit.length===1&&c.rank<11?4:0;
   if(c.suit===v.trump&&suit.length>=5)value+=12;
  }
  if(p.effective===2&&c.rank===14)value-=40;
  if(p.trump&&v.streakSeat===seat)value-=10;
  return value;
 };
 return legal.map(c=>({c,value:score(c)})).sort((a,b)=>b.value-a.value)[0].c.id;
}
/** Prefer suit length and honours, using only the caller's opening cards. */
export function chooseTrump(v:View):string{
 const suits=['S','H','D','C'];
 const strength=(s:string)=>{const cards=v.hand.filter(c=>c.suit===s);return cards.length*12+cards.reduce((n,c)=>n+Math.max(0,c.rank-9)*2,0);};
 const suit=suits.sort((a,b)=>strength(b)-strength(a)||a.localeCompare(b))[0];
 if(v.mode==='band')return [...v.hand].filter(c=>c.suit===suit).sort((a,b)=>a.rank-b.rank)[0].id;
 return suit;
}


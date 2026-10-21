import {deck,winning,type View,type Card,type Play,type Suit} from '../core/index.ts';
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
 return {reliability};
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
 const cost=(c:Card)=>{
  const trump=v.revealed&&c.suit===v.trump;
  let value=(c.rank-2)*.65+(c.rank>=11?(c.rank-10)*1.35:0);
  if(trump)value+=7+(c.rank-2)*.45;
  if(style==='conservative'&&trump)value+=4;
  // Preserve a long-suit winner; prefer discarding low cards from a short side suit.
  const length=v.hand.filter(x=>x.suit===c.suit).length;
  if(!trump&&length===1&&c.rank<11)value-=2;
  return value*(late?.55:1);
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
  return chance*run*setupWeight*(skill==='advanced'?1:.8);
 };
 const score=(c:Card)=>{
  const p=asPlay(v,seat,c,leading),lead=v.trick[0]??p;
  const winner=winning([...v.trick,p])!;
  const ours=partner(winner.seat,seat);
  let value=-cost(c);
  if(leading){
   const chance=info.reliability(p,c.suit,opponents);
   const collect=canCollect(v,seat,p);
   value+=chance*(urgency+(collect?65+pile*9:0));
   value+=followThrough(c,chance,collect);
   if(p.effective===2&&c.rank===14)value-=22;
   // Do not pull our team's remaining trumps without a collection/control reason.
   if(p.trump&&!collect)value-=style==='attacking'?2:6;
  }else if(ours){
   const chance=info.reliability(winner,lead.card.suit,opponentsAfter);
   const collect=canCollect(v,winner.seat,lead);
   value+=chance*(urgency+(collect?65+pile*9:0));
   if(winner.seat===seat){
    if(best&&partner(best.seat,seat)){
     const partnerSafe=info.reliability(best,lead.card.suit,opponentsAfter);
     // Overtaking a partner is justified only by meaningful protection of the Sar.
     value-=partnerSafe*(style==='partnership'?36:28);
    }
    value+=followThrough(c,chance,collect);
   }else if(style==='partnership')value+=2;
  }else{
   // Blocking an opponent's immediate collection is worth more than an ordinary Sar.
   if(canCollect(v,winner.seat,lead))value-=65+pile*9;
  }
  if(style==='attacking'&&winner.seat===seat)value+=4;
  return value;
 };
 // Score once per legal card. Equal-strength decisions conserve the cheaper card.
 return cards.map(c=>({card:c,value:score(c)})).sort((a,b)=>b.value-a.value||cost(a.card)-cost(b.card)||a.card.id.localeCompare(b.card.id))[0].card.id;
}
/** Prefer suit length and honours, using only the caller's opening cards. */
export function chooseTrump(v:View):string{
 const suits=['S','H','D','C'];
 const strength=(s:string)=>{const cards=v.hand.filter(c=>c.suit===s);return cards.length*12+cards.reduce((n,c)=>n+Math.max(0,c.rank-9)*2,0);};
 const suit=suits.sort((a,b)=>strength(b)-strength(a)||a.localeCompare(b))[0];
 if(v.mode==='band')return [...v.hand].filter(c=>c.suit===suit).sort((a,b)=>a.rank-b.rank)[0].id;
 return suit;
}

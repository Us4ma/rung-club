import {rightOf,nextToPlay,teamOf,rotateRights,type DealOutcome} from './seats.ts';
export type Suit='S'|'H'|'D'|'C';
export type Card={id:string,suit:Suit,rank:number};
export type Play={seat:number,card:Card,effective:number,trump:boolean,bhaag:boolean};
export type Policy={version:string,opening:number,superior:'off'|'opponent-only'|'always',voidTrump?:'optional'|'compulsory',aceChain:boolean,maxRedeals:number,collectionLead?:'eligible-senior'|'any'};
export const DEFAULT:Policy={version:'double-sar-v3-continuous',opening:5,voidTrump:'optional',superior:'off',aceChain:true,maxRedeals:64,collectionLead:'eligible-senior'};
export type DealSummary={id:string;number:number;caller:number;dealer:number;winnerTeam:number;sars:number[];outcome:DealOutcome;points:number;eligible:boolean;winners:number[]};
export type TableProgress={id:string;dealNumber:number;points:number[];dealsWon:number[];rounds:DealSummary[]};
export type Collection={sar:number;winner:number;team:number;recipient:number;count:number};
export type State={dealer?:number;table?:TableProgress;interrupted?:boolean;collections?:Collection[];opening?:import('./opening.ts').OpeningDraw,matchId:string,policy:Policy,mode:'open'|'band',phase:'calling'|'playing'|'finished',hands:Card[][],stock:Card[][],indicator:Card|null,caller:number,trump:Suit|null,revealed:boolean,turn:number,senior:number|null,trick:Play[],history:Play[][],winners:number[],pile:number,scores:number[],streakSeat:number|null,streak:number,lastAce:boolean,forceTrump:number|null,revision:number,redeals:number,result:string|null};
export const deck=():Card[]=>['S','H','D','C'].flatMap(s=>Array.from({length:13},(_,i)=>({id:s+(i+2),suit:s as Suit,rank:i+2})));
export function seeded(seed:number){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
export function secureRandom(){const a=new Uint32Array(1);let v:number;do{crypto.getRandomValues(a);v=a[0];}while(v===0xffffffff);return v/0xffffffff;}
export function shuffled(random=secureRandom){const cards=deck();for(let i=51;i>0;i--){const j=Math.floor(random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}return cards;}
export function create(mode:State['mode']='open',random=secureRandom,policy=DEFAULT,caller=0):State{const d=shuffled(random);const hands=Array.from({length:4},()=>[] as Card[]),stock=Array.from({length:4},()=>[] as Card[]);let n=0;for(const count of [5,4,4])for(let step=0;step<4;step++){const seat=(caller-step+4)%4;const group=d.slice(n,n+=count);(count===5?hands:stock)[seat].push(...group);}return {dealer:rightOf(caller),table:{id:crypto.randomUUID(),dealNumber:1,points:[0,0],dealsWon:[0,0],rounds:[]},collections:[],matchId:crypto.randomUUID(),policy:{...policy},mode,phase:'calling',hands,stock,indicator:null,caller,trump:null,revealed:mode==='open',turn:caller,senior:null,trick:[],history:[],winners:[],pile:0,scores:[0,0],streakSeat:null,streak:0,lastAce:false,forceTrump:null,revision:0,redeals:0,result:null};}
export function call(s:State,seat:number,choice:string,random=secureRandom):State{if(s.phase!=='calling'||seat!==s.caller)throw Error('Not the caller');const next=structuredClone(s);if(next.mode==='band'){const c=next.hands[seat].find(c=>c.id===choice);if(!c)throw Error('Indicator must belong to opening five');next.trump=c.suit;next.indicator=c;}else{if(!['S','H','D','C'].includes(choice))throw Error('Invalid suit');next.trump=choice as Suit;}
for(let i=0;i<4;i++)next.hands[i].push(...next.stock[i]);next.stock=[[],[],[],[]];if(next.hands.some(h=>h.filter(c=>c.suit===next.trump).length>=7)){if(s.redeals>=s.policy.maxRedeals)throw Error('Redeal safety limit; start a fresh deal');const fresh=create(s.mode,random,s.policy,s.caller);fresh.opening=s.opening;fresh.table=structuredClone(s.table);fresh.dealer=s.dealer??rightOf(s.caller);fresh.interrupted=s.interrupted;fresh.matchId=s.matchId;fresh.redeals=s.redeals+1;fresh.revision=s.revision+1;return fresh;}
if(next.indicator)next.hands[seat]=next.hands[seat].filter(c=>c.id!==next.indicator!.id);next.phase='playing';next.revision++;return next;}
export function winning(plays:Play[]):Play|undefined{let best=plays[0];if(!best)return undefined;const led=best.card.suit;const category=(p:Play)=>p.trump?2:p.card.suit===led?1:0;for(const p of plays.slice(1)){if(category(p)>category(best)||(category(p)===category(best)&&p.card.suit===best.card.suit&&p.effective>best.effective))best=p;}return best;}
/** Original led suit remains authoritative; voluntary cutting never removes discards. */
export function legal(s:State,seat:number):Card[]{
 if(s.phase!=='playing'||seat!==s.turn)return [];
 const hand=s.hands[seat],led=s.trick[0]?.card.suit;
 if(!led)return hand;
 const follow=hand.filter(c=>c.suit===led),best=winning(s.trick);
 if(follow.length)return s.revealed&&led===s.trump?superior(follow,best,s,seat):follow;
 if(!s.revealed||!s.trump)return hand;
 const trumps=superior(hand.filter(c=>c.suit===s.trump),best,s,seat);
 // A valid Band reveal imposes a separate obligation, only on its requester.
 if(s.forceTrump===seat)return trumps.length?trumps:hand;
 if(s.policy.voidTrump==='compulsory'&&trumps.length&&
   !(best&&best.seat%2===seat%2&&s.policy.superior==='opponent-only'))return trumps;
 return hand.filter(c=>c.suit!==s.trump||trumps.some(t=>t.id===c.id));
}
function superior(cards:Card[],best:Play|undefined,s:State,seat:number){
 if(s.policy.superior!=='off'&&best?.trump&&(s.policy.superior==='always'||best.seat%2!==seat%2)){
  const higher=cards.filter(c=>c.rank>best.effective);if(higher.length)return higher;
 }return cards;
}
export function canReveal(s:State,seat:number){return s.mode==='band'&&!s.revealed&&s.phase==='playing'&&s.turn===seat&&!!s.trick.length&&!s.hands[seat].some(c=>c.suit===s.trick[0].card.suit);}
export function reveal(s:State,seat:number):State{if(!canReveal(s,seat))throw Error('Reveal requires inability to follow suit on your turn');const n=structuredClone(s);n.revealed=true;if(n.indicator){n.hands[n.caller].push(n.indicator);n.indicator=null;}n.forceTrump=seat;n.revision++;return n;}
export function classifyBhaag(s:State,seat:number,c:Card,_legacyIntent?:boolean){return s.senior===seat&&s.trick.length===0&&c.rank!==14&&s.revealed&&c.suit!==s.trump;}
export function play(s:State,seat:number,id:string,intent=false):State{const card=legal(s,seat).find(c=>c.id===id);if(!card)throw Error('Illegal card or turn');const n=structuredClone(s);n.hands[seat]=n.hands[seat].filter(c=>c.id!==id);const downgraded=n.policy.aceChain&&n.trick.length===0&&n.senior===seat&&n.lastAce&&card.rank===14;n.trick.push({seat,card,effective:downgraded?2:card.rank,trump:n.revealed&&card.suit===n.trump,bhaag:classifyBhaag(s,seat,card,intent)});n.forceTrump=null;n.revision++;if(n.trick.length<4){n.turn=nextToPlay(seat);return n;}
const best=winning(n.trick)!;n.history.push(n.trick);n.winners.push(best.seat);n.pile++;n.streak=n.streakSeat===best.seat?n.streak+1:1;n.streakSeat=best.seat;const sar=n.history.length;const lead=n.trick[0];const qualifies=n.policy.collectionLead==='any'||(lead.bhaag&&lead.seat===best.seat);const collects=sar===13||(sar>=n.policy.opening&&n.streak>=2&&qualifies);if(collects){const team=teamOf(best.seat);n.collections??=[];n.collections.push({sar,winner:best.seat,team,recipient:team===teamOf(n.caller)?n.caller:n.dealer??rightOf(n.caller),count:n.pile});n.scores[team]+=n.pile;n.pile=0;n.streak=0;n.streakSeat=null;}n.senior=best.seat;n.lastAce=best.card.rank===14;n.turn=best.seat;n.trick=[];if(sar===12&&n.mode==='band'&&!n.revealed){n.revealed=true;if(n.indicator){n.hands[n.caller].push(n.indicator);n.indicator=null;}}if(sar===13){n.phase='finished';const team=n.scores[0]>n.scores[1]?0:1;n.result=n.scores[team]===13?(team===n.caller%2?'Kot':'Goon Kot'):'Team '+(team+1)+' wins';settleDeal(n);}return n;}
export type View=Omit<State,'hands'|'stock'|'indicator'|'trump'> & {hand:Card[],counts:number[],trump:Suit|null,indicator:Card|null,legal:string[],canReveal:boolean};
export function view(s:State,seat:number):View{const {hands,stock,indicator,trump,...publicState}=structuredClone(s);return {...publicState,hand:hands[seat],counts:hands.map((h,i)=>h.length+(s.phase==='calling'?0:stock[i].length)+(indicator&&i===s.caller?1:0)),trump:s.revealed||seat===s.caller?trump:null,indicator:seat===s.caller?indicator:null,legal:legal(s,seat).map(c=>c.id),canReveal:canReveal(s,seat)};}
export function invariants(s:State){const cards=[...s.hands.flat(),...s.stock.flat(),...(s.indicator?[s.indicator]:[]),...s.history.flat().map(p=>p.card),...s.trick.map(p=>p.card)];if(cards.length!==52||new Set(cards.map(c=>c.id)).size!==52)throw Error('Card conservation');if(s.scores.reduce((a,b)=>a+b,0)+s.pile!==s.history.length)throw Error('Sar conservation');}

/** A completed deal is credited exactly once, independently of starting its successor. */
export function settleDeal(s:State):DealSummary{
 if(s.phase!=='finished'||s.history.length!==13||s.scores.reduce((a,b)=>a+b,0)!==13||s.pile!==0)throw Error('Incomplete deal');
 s.table??={id:crypto.randomUUID(),dealNumber:1,points:[0,0],dealsWon:[0,0],rounds:[]};
 const existing=s.table.rounds.find(r=>r.id===s.matchId);if(existing)return existing;
 const winnerTeam=s.scores[0]>s.scores[1]?0:1,calling=winnerTeam===teamOf(s.caller),all=s.scores[winnerTeam]===13;
 const outcome:DealOutcome=all?(calling?'kot':'goon-kot'):(calling?'normal-caller':'normal-opponents');
 const summary:DealSummary={id:s.matchId,number:s.table.dealNumber,caller:s.caller,dealer:s.dealer??rightOf(s.caller),winnerTeam,sars:[...s.scores],outcome,points:s.interrupted?0:all?(calling?13:26):0,eligible:!s.interrupted,winners:[...s.winners]};
 s.table.points[winnerTeam]+=summary.points;s.table.dealsWon[winnerTeam]++;s.table.rounds.push(summary);return summary;
}
export function nextDeal(s:State,random=secureRandom):State{
 if(s.phase!=='finished')throw Error('Deal is still active');
 const previous=structuredClone(s),summary=settleDeal(previous),rights=rotateRights(previous.caller,summary.dealer,summary.outcome);
 const fresh=create(s.mode,random,{...s.policy,version:DEFAULT.version,collectionLead:s.policy.collectionLead??DEFAULT.collectionLead},rights.caller);fresh.dealer=rights.dealer;fresh.table=previous.table!;fresh.table.dealNumber++;fresh.revision=s.revision+1;return fresh;
}

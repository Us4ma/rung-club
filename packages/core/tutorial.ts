import {call,play,create,deck,type State,type Card,type Play,DEFAULT} from './index.ts';
// Scripted, deterministic teaching fixtures. No private hands are passed to bots.
export function lesson(index:number):State{const d=deck();const card=(id:string)=>d.find(c=>c.id===id)!;const s=create('open',()=>.5);s.stock=[[],[],[],[]];s.trump='H';s.revealed=true;s.phase='playing';s.turn=0;s.senior=index>=3?0:null;s.revision=0;const used=new Set<string>();const take=(id:string)=>{used.add(id);return card(id);};
if(index===1){s.trick=[{seat:1,card:take('C13'),effective:13,trump:false,bhaag:false},{seat:2,card:take('C4'),effective:4,trump:false,bhaag:false},{seat:3,card:take('C3'),effective:3,trump:false,bhaag:false}];}
if(index===2){s.trick=[{seat:1,card:take('S14'),effective:14,trump:false,bhaag:false},{seat:2,card:take('S3'),effective:3,trump:false,bhaag:false},{seat:3,card:take('S4'),effective:4,trump:false,bhaag:false}];}
if(index===3){s.trick=[{seat:1,card:take('D13'),effective:13,trump:false,bhaag:false},{seat:2,card:take('D3'),effective:3,trump:false,bhaag:false},{seat:3,card:take('D4'),effective:4,trump:false,bhaag:false}];}
if(index>=4){for(let n=0;n<4;n++){const suit=['S','C','D','S'][n];const ids=[suit+(n+5),suit+(n+2),suit+(n+9),suit+(n+11)]; // Use remaining cards to maintain fixture uniqueness.
const group=d.filter(c=>!used.has(c.id)).slice(0,4);s.history.push(group.map((c,i)=>({seat:i,card:take(c.id),effective:c.rank,trump:c.suit==='H',bhaag:false})));}s.winners=[1,2,3,0];s.pile=4;s.streakSeat=0;s.streak=1;s.senior=0;}
const reserve=index===1?['C14','C2','H14']:index===2?['H14','H2','D2']:index===3?['D14','D2','H13']:['H14','H13','C14'];const own=reserve.filter(id=>!used.has(id)).map(take);let remaining=d.filter(c=>!used.has(c.id));const ownLength=13-s.history.length;while(own.length<ownLength){const i=index===2?remaining.findIndex(c=>c.suit!=='S'):0;const [c]=remaining.splice(i,1);own.push(take(c.id));}s.hands=[own,[],[],[]];for(let seat=1;seat<4;seat++){const count=13-s.history.length-(s.trick.some(p=>p.seat===seat)?1:0);s.hands[seat]=remaining.splice(0,count);}return s;}

/** One continuous conserved deal. Five Sars teach Senior, cutting and opening collection. */
export function guidedDeal():State{
 const s=create('open',()=>.5,DEFAULT,0),d=deck();const own=['C13','H14','H13','H12','C2','H11','H10','H9','D14','D13','D12','D11','D10'];
 const assigned=[own,['C3','C4','S2'],['C5','C6','S3'],['C14','C7','S14']];
 const used=new Set(assigned.flat());const remaining=d.filter(c=>!used.has(c.id));
 while(remaining.length)for(let seat=1;seat<4;seat++)if(assigned[seat].length<13&&remaining.length)assigned[seat].push(remaining.shift()!.id);
 const hands=assigned.map(ids=>ids.map(id=>d.find(c=>c.id===id)!));
 s.hands=hands.map(h=>h.slice(0,5));s.stock=hands.map(h=>h.slice(5));s.opening=undefined;return s;
}
export const guidedCards=['C13','C2','H14','H13','H12'];
export function scriptedCard(v:import('./index.ts').View):string{
 const preferred=v.history.length===1&&v.turn===3?'C14':v.history.length===2&&v.turn===3&&!v.trick.length?'S14':null;
 if(preferred&&v.legal.includes(preferred))return preferred;
 return [...v.hand].filter(c=>v.legal.includes(c.id)).sort((a,b)=>a.rank-b.rank||a.id.localeCompare(b.id))[0].id;
}
export type AdvancedLesson='Ace-on-Ace'|'Bhaag'|'Band Rung reveal'|'Kot';
export function advancedLesson(kind:AdvancedLesson):State{
 let s=guidedDeal();if(kind==='Band Rung reveal'){s.mode='band';s.revealed=false;s=call(s,0,'H14');while(!(s.turn===0&&s.history.length===2&&s.trick.length===3)){s=play(s,s.turn,s.turn===0?guidedCards[s.history.length]:scriptedCard(importView(s,s.turn)));}return s;}
 s=call(s,0,'H');if(kind==='Ace-on-Ace'||kind==='Bhaag'){
 const lead=kind==='Ace-on-Ace'?'H14':'C13';s=play(s,0,lead);while(s.trick.length)s=play(s,s.turn,scriptedCard(importView(s,s.turn)));return s;}
 // A generated real match, not a fabricated score: find a seeded all-13 Kot example.
 for(let seed=1;seed<=1000;seed++){let candidate=create('open',seededTutorial(seed));candidate=call(candidate,candidate.caller,'H',seededTutorial(seed+1));while(candidate.phase==='calling')candidate=call(candidate,candidate.caller,'H',seededTutorial(seed+2+candidate.redeals));while(candidate.phase!=='finished'){const v=importView(candidate,candidate.turn);candidate=play(candidate,candidate.turn,v.legal[0]);}if(candidate.result==='Kot'||candidate.result==='Goon Kot')return candidate;}
 throw Error('Kot lesson example unavailable');
}
import {view as importView,seeded as seededTutorial} from './index.ts';

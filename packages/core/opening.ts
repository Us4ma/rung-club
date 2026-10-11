import {create,deck,shuffled,secureRandom,type Card,type State,DEFAULT} from './index.ts';
export type DrawRound={cards:{seat:number;card:Card}[];eligible:number[]};
export type OpeningDraw={version:'highest-rank-v1';rounds:DrawRound[];winner:number;boundedFallback:boolean};
/** Public selection cards only. Consumes an independent deck, never the deal deck. */
export function openingDraw(random=secureRandom,selection?:Card[]):OpeningDraw{
 let pool=selection?[...selection]:shuffled(random),eligible=[0,1,2,3];const rounds:DrawRound[]=[];
 for(let n=0;n<64;n++){
  if(pool.length<eligible.length)pool=shuffled(random);
  const cards=eligible.map(seat=>({seat,card:pool.shift()!}));
  const highest=Math.max(...cards.map(p=>p.card.rank));eligible=cards.filter(p=>p.card.rank===highest).map(p=>p.seat);
  rounds.push({cards,eligible:[...eligible]});if(eligible.length===1)return {version:'highest-rank-v1',rounds,winner:eligible[0],boundedFallback:false};
 }
 // Bounded repeated-tie policy: fresh cards of distinct shuffled ranks, only survivors.
 const ranks=shuffled(random).filter((c,i,a)=>a.findIndex(x=>x.rank===c.rank)===i);
 const cards=eligible.map((seat,i)=>({seat,card:ranks[i]}));const winner=cards.reduce((a,b)=>a.card.rank>b.card.rank?a:b).seat;
 rounds.push({cards,eligible:[winner]});return {version:'highest-rank-v1',rounds,winner,boundedFallback:true};
}
export function createMatch(mode:State['mode']='open',random=secureRandom):State{const opening=openingDraw(random);return {...create(mode,random,DEFAULT,opening.winner),opening};}

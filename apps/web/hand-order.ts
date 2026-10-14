import type {Card,Suit} from '../../packages/core/index.ts';
/** Alternate suit groups, starting with the colour having more groups. */
export function sortHandAlternating(hand:Card[]):Card[]{
 const present=new Set(hand.map(c=>c.suit));
 const black:Suit[]=(['S','C'] as Suit[]).filter(s=>present.has(s));
 const red:Suit[]=(['H','D'] as Suit[]).filter(s=>present.has(s));
 const order:Suit[]=[];let blackNext=black.length>=red.length;
 while(black.length||red.length){const preferred=blackNext?black:red,other=blackNext?red:black;order.push((preferred.length?preferred:other).shift()!);blackNext=!blackNext;}
 return [...hand].sort((a,b)=>order.indexOf(a.suit)-order.indexOf(b.suit)||b.rank-a.rank);
}

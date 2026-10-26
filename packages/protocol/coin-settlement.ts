/** Server-authoritative coin arithmetic shared with settlement presentation. */
export function dealSettlement(stake:number,winner:number,outcome:string|undefined,scores?:number[],refund=false,goonSupplement:number|boolean=true){
 if(!Number.isSafeInteger(stake)||stake<=0||stake%2)throw Error('Invalid deal stake');
 const extra=goonSupplement&&!refund&&outcome==='goon-kot'&&[0,1].includes(winner)?(typeof goonSupplement==='number'?Math.min(3*stake,goonSupplement):3*stake):0;
 const contributions=[0,1,2,3].map(seat=>stake+(seat%2!==winner?extra:0));
 const pot=contributions.reduce((a,b)=>a+b,0);
 let payouts:number[]=[0,0,0,0];
 if(refund)payouts=[stake,stake,stake,stake];
 else if([0,1].includes(winner)){
  if(outcome==='kot'||outcome==='goon-kot'){
   // Existing fee: 25% of losing stakes for Kot; 10% for Goon Kot.
   const loserPool=2*(stake+extra),fee=Math.ceil(loserPool*(outcome==='kot'?25:10)/100);
   const each=Math.floor((pot-fee)/2);payouts=payouts.map((_,seat)=>seat%2===winner?each:0);
  }else{
   if(!scores||scores.length!==2||scores.some(n=>!Number.isInteger(n)||n<0)||scores[0]+scores[1]!==13)throw Error('Incomplete Sar collection totals');
   if(scores[winner]<=scores[1-winner])throw Error('Winner does not match collected Sars');
   // Preserve the ordinary deal fee (25% of the pot), once. Equal partner shares.
   const available=2*Math.floor((pot-Math.ceil(pot/4))/2),loser=1-winner;
   const lowEach=Math.floor(available*scores[loser]/13/2),highEach=available/2-lowEach;
   payouts=payouts.map((_,seat)=>seat%2===winner?highEach:lowEach);
  }
 }
 return {winner,payout:payouts[winner]??0,payouts,extra,contributions,pot,rake:pot-payouts.reduce((a,b)=>a+b,0)};
}

/** Only the calling partnership can lose through Goon Kot. */
export function seatStakeRequirement(stake:number,seat:number,caller?:number){
 return stake*(Number.isInteger(caller)&&caller!>=0&&caller!<4&&seat%2===caller!%2?4:1);
}

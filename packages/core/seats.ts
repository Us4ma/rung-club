/** Seats increase clockwise on screen; play proceeds anticlockwise. */
export const teamOf=(seat:number)=>seat%2;
export const partnerOf=(seat:number)=>(seat+2)%4;
export const rightOf=(seat:number)=>(seat+1)%4;
export const callerLeftOfDealer=(dealer:number)=>(dealer+3)%4;
export const nextToPlay=(seat:number)=>(seat+3)%4;
export type DealOutcome='normal-caller'|'normal-opponents'|'kot'|'goon-kot';
export function rotateRights(caller:number,dealer:number,outcome:DealOutcome){
 if(dealer!==rightOf(caller))throw Error('Dealer must be to caller’s right');
 if(outcome==='normal-caller')return {caller,dealer};
 const nextDealer=outcome==='kot'?partnerOf(dealer):caller;
 return {caller:callerLeftOfDealer(nextDealer),dealer:nextDealer};
}

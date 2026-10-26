import {seatStakeRequirement} from './coin-settlement.ts';
export const TABLE_TIERS=[
 {id:2500,name:'Emerald',label:'Low stakes',buyIn:2500,minStake:200,maxStake:1000,step:50},
 {id:5000,name:'Royal',label:'Mid stakes',buyIn:5000,minStake:400,maxStake:2000,step:200},
 {id:10000,name:'Crown',label:'High stakes',buyIn:10000,minStake:800,maxStake:4000,step:400},
] as const;
export type TableChoice={tier:number;stake:number};
export function tableChoice(input?:Partial<TableChoice>|null):TableChoice{
 const tier=TABLE_TIERS.find(t=>t.id===(input?.tier??2500));
 const stake=input?.stake??tier?.minStake;
 if(!tier||!Number.isSafeInteger(stake)||stake!<tier.minStake||stake!>tier.maxStake||(stake!-tier.minStake)%tier.step)throw Error('Choose a valid table and stake.');
 return {tier:tier.id,stake:stake!};
}
export const tableTier=(id:number)=>TABLE_TIERS.find(t=>t.id===id)||TABLE_TIERS[0];

export function affordableStake(tierId:number,balances:(number|null)[],caller:number){
 const tier=tableTier(tierId),available=Math.min(tier.maxStake,...balances.flatMap((n,seat)=>typeof n==='number'?[Math.floor(n/seatStakeRequirement(1,seat,caller))]:[]));
 return Math.max(0,tier.minStake+Math.floor((available-tier.minStake)/tier.step)*tier.step);
}

import {it,expect} from 'vitest';
import {dealSettlement,seatStakeRequirement} from '../packages/protocol/coin-settlement.ts';
it.each([200,250,500,1000])('reserves four stakes for both callers and conserves coins at stake %i',stake=>{
 for(const caller of [0,1,2,3]){
  const winner=1-caller%2;
  expect([0,1,2,3].map(seat=>seatStakeRequirement(stake,seat,caller))).toEqual([0,1,2,3].map(seat=>seat%2===caller%2?4*stake:stake));
  const plan=dealSettlement(stake,winner,'goon-kot');
  expect(plan.extra).toBe(3*stake);
  expect(plan.contributions).toEqual([0,1,2,3].map(seat=>seat%2===caller%2?4*stake:stake));
  expect(plan.pot).toBe(10*stake);
  expect(plan.rake).toBe(Math.ceil(8*stake/10));
  expect(plan.payouts.reduce((a,b)=>a+b,0)+plan.rake).toBe(plan.pot);
 }
});
it('honors the stored reserve of an already funded legacy deal',()=>{
 expect(dealSettlement(200,1,'goon-kot',undefined,false,200).extra).toBe(200);
 expect(dealSettlement(200,1,'goon-kot',undefined,false,0).extra).toBe(0);
});
it('releases the full supplement for Kot, normal play and refunds',()=>{
 for(const [outcome,scores,refund] of [['kot',undefined,false],['normal-caller',[8,5],false],['goon-kot',undefined,true]] as const){
  const plan=dealSettlement(200,0,outcome,scores?[...scores]:undefined,refund,600);
  expect(plan.extra).toBe(0);expect(plan.contributions).toEqual([200,200,200,200]);
 }
});

it('caps a 1,000-coin calling stack at 250, including the partner limit',async()=>{
 const {affordableStake,tableChoice}=await import('../packages/protocol/table-stakes.ts');
 expect(affordableStake(2500,[1000,2500,2500,2500],0)).toBe(250);
 expect(affordableStake(2500,[2500,2500,1000,2500],0)).toBe(250);
 expect(tableChoice({tier:2500,stake:250}).stake).toBe(250);
 expect(affordableStake(2500,[799,2500,2500,2500],0)).toBeLessThan(200);
});

import {it,expect} from 'vitest';
import {dealSettlement,seatStakeRequirement} from '../packages/protocol/coin-settlement.ts';

it('charges each losing caller-side player four times the selected stake on Goon Kot',()=>{
 const stake=1000,caller=0;
 expect([0,1,2,3].map(seat=>seatStakeRequirement(stake,seat,caller))).toEqual([4000,1000,4000,1000]);
 const result=dealSettlement(stake,1,'goon-kot',undefined,false,3*stake);
 expect(result.extra).toBe(3000);
 expect(result.contributions).toEqual([4000,1000,4000,1000]);
 expect(result.payouts).toEqual([0,4600,0,4600]);
 expect(result.rake).toBe(800);
});

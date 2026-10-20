import type {IdentityDatabase} from './identity.ts';
import {ensureCoinStandings} from './coin-schema.ts';
/** Lifetime positive profit only: never count returned stakes or wallet credits. */
export async function totalGoldWon(db:IdentityDatabase,uid:string,roster=false){
 await ensureCoinStandings(db);
 const sql=roster
  ? "SELECT COALESCE(SUM(MAX(e.amount-rule.stake,0)),0) total FROM roster_results r JOIN coin_events e ON e.id='bot-payout:'||r.match_id||':'||r.seat AND e.kind='bot-payout' JOIN coin_deal_rules rule ON rule.deal=r.match_id JOIN coin_deals d ON d.id=r.match_id AND d.status='settled' WHERE r.roster_id=? AND r.source='table' AND r.mode='open'"
  : "SELECT COALESCE(SUM(MAX(c.profit,0)),0) total FROM coin_results c JOIN coin_deals d ON d.id=c.deal AND d.status='settled' JOIN results r ON r.match_id=c.deal AND r.uid=c.uid WHERE c.uid=?";
 const result=await db.prepare(sql).bind(uid).first<{total:number}>();return Number(result?.total??0);
}

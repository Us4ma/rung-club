import {addDeal,emptyStats,type PlayerStats} from '../../packages/protocol/player-progress.ts';
import type {IdentityDatabase} from './identity.ts';
/** Historical totals remain intact; outcome-specific counts start with recorded outcomes. */
export async function playerStats(db:IdentityDatabase,uid:string){
 const rows=await db.prepare("SELECT r.won,r.score,l.kind FROM results r LEFT JOIN ledger l ON l.id='match:'||r.match_id||':'||r.uid WHERE r.uid=? ORDER BY r.created,r.match_id").bind(uid).all();
 return (rows.results as {won:number;score:number;kind:string|null}[]).reduce<PlayerStats>((s,row)=>addDeal(s,!!row.won,Number(row.score)||0,String(row.kind||'').replace('match:','')),emptyStats());
}

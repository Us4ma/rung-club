import {guestName} from '../../packages/protocol/player-name.ts';
import {safeAvatarPhoto} from '../../packages/protocol/avatars.ts';
import {ROSTER,rosterById} from '../../packages/protocol/roster.ts';
import {addDeal,emptyStats} from '../../packages/protocol/player-progress.ts';
import {invariants,type State} from '../../packages/core/index.ts';
import type {IdentityDatabase} from './identity.ts';
export const ROSTER_SCHEMA=`CREATE TABLE IF NOT EXISTS roster_results(match_id TEXT NOT NULL,roster_id TEXT NOT NULL,seat INTEGER NOT NULL,won INTEGER NOT NULL,sars INTEGER NOT NULL,outcome TEXT NOT NULL,points INTEGER NOT NULL,mode TEXT NOT NULL,created INTEGER NOT NULL,history TEXT NOT NULL,source TEXT NOT NULL,PRIMARY KEY(match_id,roster_id))`;
export async function ensureRoster(db:IdentityDatabase){await db.prepare(ROSTER_SCHEMA).bind().run();await db.prepare('CREATE INDEX IF NOT EXISTS roster_result_player ON roster_results(roster_id,created)').bind().run();}
export function rosterStatements(db:IdentityDatabase,s:State,ids:(string|null)[],now:number,source='table'){
 if(s.phase!=='finished'||s.history.length!==13)throw Error('Only complete deals can be recorded');invariants(s);
 const r=s.table!.rounds.at(-1)!;if(r.id!==s.matchId)throw Error('Missing authoritative result');
 return ids.flatMap((id,seat)=>!rosterById(id)?[]:[db.prepare('INSERT OR IGNORE INTO roster_results VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(s.matchId,id,seat,+(r.winnerTeam===seat%2),s.scores[seat%2],r.outcome,r.winnerTeam===seat%2?r.points:0,s.mode,now,JSON.stringify(s.history),source)]);
}
export async function rosterProfile(db:IdentityDatabase,id:string){const p=rosterById(id);if(!p)return null;await ensureRoster(db);
 const rows=(await db.prepare('SELECT match_id,won,sars,outcome,points,mode,created,source FROM roster_results WHERE roster_id=? ORDER BY created,match_id').bind(id).all()).results as any[];
 const stats=rows.reduce((s,r)=>addDeal(s,!!r.won,r.sars,r.outcome),emptyStats());
 return {...p,isBot:true,persistent:true,stats,losses:stats.matches-stats.wins,points:rows.reduce((n,r)=>n+r.points,0),history:rows.slice(-30).reverse()};
}
// Future gold ranking is deliberately disabled until authoritative gold-win settlement exists.
export const STANDINGS_BY_TOTAL_GOLD=false;
export function compareTotalGold(a:{totalGoldWon:number},b:{totalGoldWon:number}){return b.totalGoldWon-a.totalGoldWon;}
export async function leaderboard(db:IdentityDatabase){await ensureRoster(db);
 const humans=(await db.prepare("SELECT a.uid,a.name,(SELECT SUBSTR(item,19) FROM cosmetics c WHERE c.uid=a.uid AND c.item LIKE 'profile:avatar-v2:%' ORDER BY item LIMIT 1) avatar,COUNT(r.match_id) played,COALESCE(SUM(r.won),0) wins,COALESCE(SUM(r.score),0) sars FROM accounts a JOIN results r ON r.uid=a.uid WHERE a.deleted=0 GROUP BY a.uid ORDER BY wins DESC,sars DESC,a.uid LIMIT 100").bind().all()).results as any[];
 const bots=(await db.prepare('SELECT roster_id,COUNT(*) played,SUM(won) wins,SUM(sars) sars FROM roster_results GROUP BY roster_id').bind().all()).results as any[];
 const profiles=(await db.prepare("SELECT uid,item FROM cosmetics WHERE item LIKE 'profile:google:%' OR item IN ('profile:google-name-default','profile:avatar-source:roster')").bind().all()).results as {uid:string;item:string}[];
 function presentation(r:any){const items=profiles.filter(p=>p.uid===r.uid).map(p=>p.item);let google:any={};try{google=JSON.parse((items.find(p=>p.startsWith('profile:google:'))||'').slice(15));}catch{}return {name:items.includes('profile:google-name-default')&&google.displayName?google.displayName:r.name.startsWith('Guest-')?guestName(r.uid):r.name,photoURL:items.includes('profile:avatar-source:roster')?undefined:safeAvatarPhoto(google.photoURL)};}
 const rows=[...humans.map(r=>({...presentation(r),played:Number(r.played),wins:Number(r.wins),sars:Number(r.sars),avatar:Number(r.avatar)||1,key:'human:'+r.uid})),...ROSTER.map(p=>{const r=bots.find(r=>r.roster_id===p.id);return {name:p.name,played:Number(r?.played||0),wins:Number(r?.wins||0),sars:Number(r?.sars||0),avatar:p.avatar,key:p.id};})].sort((a,b)=>b.wins-a.wins||b.sars-a.sars||Number(!!b.played)-Number(!!a.played)||a.key.localeCompare(b.key));
 return {basis:'Completed deal wins, then Sars collected',notice:'Matches and standings may include computer-controlled roster opponents. Results come from completed games, including roster exhibitions.',rows:rows.slice(0,100).map(({key,...r},i)=>({...r,rank:r.played?i+1:null,losses:r.played-r.wins,winRate:r.played?Math.round(r.wins/r.played*100):0}))};
}

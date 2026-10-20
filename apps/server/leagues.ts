import {publicPlayerProfile} from './public-profile.ts';
import {rosterProfile} from './roster-store.ts';
import {ROSTER,rosterById} from '../../packages/protocol/roster.ts';
import {LEAGUES,LEAGUE_RULES,WEEK_MS,leagueWeek,type LeagueOutcome,type LeagueFinish} from '../../packages/protocol/leagues.ts';
import {publicPlayerName} from '../../packages/protocol/player-name.ts';
import {publicGoogleProfile} from './google-profile.ts';
import {playerAvatar} from './avatar-profile.ts';
const schema=[
 `CREATE TABLE IF NOT EXISTS league_bot_wallet(uid TEXT PRIMARY KEY,balance INTEGER NOT NULL DEFAULT 0)`,
 `CREATE TABLE IF NOT EXISTS league_bot_prizes(id TEXT PRIMARY KEY,uid TEXT NOT NULL,amount INTEGER NOT NULL,created INTEGER NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS league_bot_honors(uid TEXT NOT NULL,item TEXT NOT NULL,PRIMARY KEY(uid,item))`,
 `CREATE TABLE IF NOT EXISTS league_seasons(start INTEGER PRIMARY KEY,ends INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'active')`,
 `CREATE TABLE IF NOT EXISTS league_players(uid TEXT PRIMARY KEY,tier INTEGER NOT NULL DEFAULT 0,highest INTEGER NOT NULL DEFAULT 0,last_season INTEGER NOT NULL DEFAULT 0)`,
 `CREATE TABLE IF NOT EXISTS league_groups(id TEXT PRIMARY KEY,season INTEGER NOT NULL,tier INTEGER NOT NULL,number INTEGER NOT NULL,settled INTEGER NOT NULL DEFAULT 0,UNIQUE(season,tier,number))`,
 `CREATE INDEX IF NOT EXISTS league_due_groups ON league_groups(season,settled)`,
 `CREATE TABLE IF NOT EXISTS league_members(season INTEGER NOT NULL,uid TEXT NOT NULL,group_id TEXT NOT NULL,tier INTEGER NOT NULL,earnings INTEGER NOT NULL DEFAULT 0,wins INTEGER NOT NULL DEFAULT 0,matches INTEGER NOT NULL DEFAULT 0,achieved INTEGER NOT NULL,PRIMARY KEY(season,uid))`,
 `CREATE INDEX IF NOT EXISTS league_group_rank ON league_members(group_id,earnings DESC,wins DESC,matches,achieved,uid)`,
 `CREATE TABLE IF NOT EXISTS league_results(season INTEGER NOT NULL,uid TEXT NOT NULL,group_id TEXT NOT NULL,tier INTEGER NOT NULL,next_tier INTEGER NOT NULL,rank INTEGER NOT NULL,earnings INTEGER NOT NULL,reward INTEGER NOT NULL,outcome TEXT NOT NULL,title TEXT NOT NULL,badge TEXT NOT NULL,seen INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(season,uid))`,
 `CREATE INDEX IF NOT EXISTS league_player_results ON league_results(uid,season DESC)`,
 `CREATE TABLE IF NOT EXISTS league_score_marks(season INTEGER NOT NULL,uid TEXT NOT NULL,earnings INTEGER NOT NULL,achieved INTEGER NOT NULL,PRIMARY KEY(season,uid,earnings))`,
 `CREATE TABLE IF NOT EXISTS league_deals(deal TEXT PRIMARY KEY,season INTEGER NOT NULL,created INTEGER NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS league_earnings(deal TEXT NOT NULL,uid TEXT NOT NULL,season INTEGER NOT NULL,amount INTEGER NOT NULL,won INTEGER NOT NULL,created INTEGER NOT NULL,PRIMARY KEY(deal,uid))`,
 `CREATE INDEX IF NOT EXISTS league_earning_daily ON league_earnings(uid,created)`,
 `CREATE TABLE IF NOT EXISTS league_pairs(low_uid TEXT NOT NULL,high_uid TEXT NOT NULL,day INTEGER NOT NULL,deals INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(low_uid,high_uid,day))`,
];
const ready=new WeakMap<object,Promise<void>>();
export function ensureLeagues(db:D1Database){let p=ready.get(db);if(!p){p=(async()=>{for(const sql of schema)await db.prepare(sql).run();})().catch(e=>{ready.delete(db);throw e;});ready.set(db,p);}return p;}
type Member={uid:string;group_id:string;tier:number;earnings:number;wins:number;matches:number;achieved:number};
async function ranked(db:D1Database,group:string){return (await db.prepare("SELECT m.* FROM league_members m LEFT JOIN accounts a ON a.uid=m.uid WHERE (a.deleted=0 OR m.uid LIKE 'roster:%') AND m.group_id=? ORDER BY m.earnings DESC,m.wins DESC,m.matches,m.achieved,m.uid").bind(group).all<Member>()).results;}
function zones(rows:Member[]){const active=rows.filter(r=>r.matches>0).length,provisional=rows.length<LEAGUE_RULES.minMembers||active<LEAGUE_RULES.minActive;return {provisional,zone:provisional?0:Math.floor(rows.length/4)};}
function outcome(tier:number,rank:number,count:number,zone:number,matches:number):LeagueOutcome{if(!zone)return 'provisional';if(rank<=zone&&matches>0)return tier===4?'elite':'promote';if(rank>count-zone&&tier>0)return 'demote';return 'retain';}
/** Runs only inside the serialized __coins coordinator. Each group freezes and pays in one D1 batch. */
export async function advanceLeagues(db:D1Database,now=Date.now()){
 await ensureLeagues(db);const start=leagueWeek(now);
 const pending=(await db.prepare('SELECT * FROM league_groups WHERE season<? AND settled=0 ORDER BY season,tier,number').bind(start).all<{id:string;season:number;tier:number}>()).results;
 for(const group of pending){const rows=await ranked(db,group.id),{zone}=zones(rows),statements:D1PreparedStatement[]=[];
  for(const [i,r] of rows.entries()){const rank=i+1,result=outcome(group.tier,rank,rows.length,zone,r.matches),nextTier=result==='promote'?group.tier+1:result==='demote'?group.tier-1:group.tier;
   const prizes=LEAGUES[group.tier].prizes,reward=zone&&r.matches>0?(rank<=3?prizes[rank-1]:rank<=Math.min(10,zone)?prizes[3]:0):0;
   const badge=zone&&r.matches>0&&rank<=3?'league:'+group.season+':'+(group.tier===4&&rank===1?'world-champion':'podium:'+rank+':tier:'+group.tier):'';
   const title=zone&&r.matches>0&&group.tier===4&&rank<=Math.min(10,zone)?(rank===1?'World Champion':'World Elite')+' · '+new Date(group.season).toISOString().slice(0,10):'';
   statements.push(db.prepare('INSERT OR IGNORE INTO league_results(season,uid,group_id,tier,next_tier,rank,earnings,reward,outcome,title,badge) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(group.season,r.uid,group.id,group.tier,nextTier,rank,r.earnings,reward,result,title,badge));
   statements.push(db.prepare('UPDATE league_players SET tier=?,highest=MAX(highest,?),last_season=? WHERE uid=? AND last_season<?').bind(nextTier,nextTier,group.season,r.uid,group.season));
   const bot=!!rosterById(r.uid);
   if(reward&&bot){const id='league:'+group.season+':'+r.uid;statements.push(db.prepare('INSERT OR IGNORE INTO league_bot_wallet(uid) VALUES(?)').bind(r.uid),db.prepare('UPDATE league_bot_wallet SET balance=balance+? WHERE uid=? AND NOT EXISTS(SELECT 1 FROM league_bot_prizes WHERE id=?)').bind(reward,r.uid,id),db.prepare('INSERT OR IGNORE INTO league_bot_prizes(id,uid,amount,created) VALUES(?,?,?,?)').bind(id,r.uid,reward,now));}
   if(reward&&!bot)statements.push(db.prepare("INSERT OR IGNORE INTO ledger(id,uid,amount,xp,kind,created) SELECT ?,?,?,0,'league-prize',? WHERE EXISTS(SELECT 1 FROM accounts WHERE uid=? AND deleted=0)").bind('league:'+group.season+':'+r.uid,r.uid,reward,now,r.uid));
   for(const item of [badge,title?'league-title:'+title:''].filter(Boolean))statements.push(db.prepare(bot?'INSERT OR IGNORE INTO league_bot_honors(uid,item) VALUES(?,?)':'INSERT OR IGNORE INTO cosmetics(uid,item) VALUES(?,?)').bind(r.uid,item));
  }
  statements.push(db.prepare('UPDATE league_groups SET settled=1 WHERE id=? AND settled=0').bind(group.id));await db.batch(statements);
 }
 await db.prepare("UPDATE league_seasons SET status='finished' WHERE ends<=? AND NOT EXISTS(SELECT 1 FROM league_groups g WHERE g.season=league_seasons.start AND g.settled=0)").bind(now).run();
 await db.prepare('INSERT OR IGNORE INTO league_seasons(start,ends) VALUES(?,?)').bind(start,start+WEEK_MS).run();
 // Enroll the existing roster as real server-controlled participants; no fabricated results.
 if(LEAGUE_RULES.includeRoster){const seeded=await db.prepare("SELECT COUNT(*) n FROM league_players WHERE uid LIKE 'roster:%'").first<{n:number}>();if((seeded?.n??0)<ROSTER.length)await db.batch(ROSTER.map(bot=>db.prepare('INSERT OR IGNORE INTO league_players(uid) VALUES(?)').bind(bot.id)));}
 // Only missing memberships are assigned. Active-season groups never move.
 // Bounded work resumes on the next coordinator request for larger populations.
 const entrants=(await db.prepare("SELECT p.uid FROM league_players p LEFT JOIN accounts a ON a.uid=p.uid WHERE (a.deleted=0 OR (?=1 AND p.uid LIKE 'roster:%')) AND NOT EXISTS(SELECT 1 FROM league_members m WHERE m.uid=p.uid AND m.season=?) ORDER BY RANDOM() LIMIT 32").bind(+LEAGUE_RULES.includeRoster,start).all<{uid:string}>()).results;
 for(const entrant of entrants)await assign(db,entrant.uid,start,now);
 return start;
}
async function assign(db:D1Database,uid:string,season:number,now:number){
 const bot=LEAGUE_RULES.includeRoster&&rosterById(uid);const account=bot||await db.prepare('SELECT uid FROM accounts WHERE uid=? AND deleted=0').bind(uid).first();if(!account)throw Error('League account unavailable');
 await db.prepare('INSERT OR IGNORE INTO league_players(uid) VALUES(?)').bind(uid).run();
 const player=(await db.prepare('SELECT tier,highest FROM league_players WHERE uid=?').bind(uid).first<{tier:number;highest:number}>())!;
 let member=await db.prepare('SELECT * FROM league_members WHERE season=? AND uid=?').bind(season,uid).first<Member>();
 if(!member){let group=await db.prepare('SELECT g.id FROM league_groups g WHERE g.season=? AND g.tier=? AND g.settled=0 AND (SELECT COUNT(*) FROM league_members m WHERE m.group_id=g.id)<? ORDER BY g.number LIMIT 1').bind(season,player.tier,LEAGUE_RULES.capacity).first<{id:string}>();
  if(!group){const row=await db.prepare('SELECT COALESCE(MAX(number),0)+1 n FROM league_groups WHERE season=? AND tier=?').bind(season,player.tier).first<{n:number}>();group={id:season+':'+player.tier+':'+row!.n};await db.prepare('INSERT INTO league_groups(id,season,tier,number) VALUES(?,?,?,?)').bind(group.id,season,player.tier,row!.n).run();}
  await db.prepare('INSERT OR IGNORE INTO league_members(season,uid,group_id,tier,achieved) VALUES(?,?,?,?,?)').bind(season,uid,group.id,player.tier,now).run();member=(await db.prepare('SELECT * FROM league_members WHERE season=? AND uid=?').bind(season,uid).first<Member>())!;
 }await db.prepare('INSERT OR IGNORE INTO league_score_marks(season,uid,earnings,achieved) VALUES(?,?,?,?)').bind(season,uid,member.earnings,member.achieved).run();return {player,member};
}
/** Amounts come from this same coin settlement, never an HTTP caller. Included in its atomic batch. */
export async function leagueSettlement(db:D1Database,input:{deal:string;eligible:boolean;players:(string|null)[];profits:number[];winner:number},now=Date.now()):Promise<D1PreparedStatement[]>{
 await ensureLeagues(db);if(!input.eligible||input.players.length!==4||input.players.some(p=>!p)||new Set(input.players).size!==4)return [];
 if(await db.prepare('SELECT deal FROM league_deals WHERE deal=?').bind(input.deal).first())return [];
 const ids=input.players as string[],day=Math.floor(now/86400000),pairs:[string,string][]=[];
 for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const pair=[ids[i],ids[j]].sort() as [string,string];if(pair.every(id=>!!rosterById(id)))continue;pairs.push(pair);const count=await db.prepare('SELECT deals FROM league_pairs WHERE low_uid=? AND high_uid=? AND day=?').bind(...pair,day).first<{deals:number}>();if((count?.deals??0)>=LEAGUE_RULES.maxPairDealsPerDay)return [];}
 for(const uid of ids){if(LEAGUE_RULES.includeRoster&&rosterById(uid))continue;const count=await db.prepare('SELECT COUNT(*) n FROM league_earnings WHERE uid=? AND created>=?').bind(uid,day*86400000).first<{n:number}>();if((count?.n??0)>=LEAGUE_RULES.maxDealsPerDay)return [];if(!(LEAGUE_RULES.includeRoster&&rosterById(uid))&&!await db.prepare('SELECT uid FROM accounts WHERE uid=? AND deleted=0').bind(uid).first())return [];}
 const season=await advanceLeagues(db,now),assigned:Member[]=[];for(const uid of ids)assigned.push((await assign(db,uid,season,now)).member);
 const statements=[db.prepare('INSERT INTO league_deals(deal,season,created) VALUES(?,?,?)').bind(input.deal,season,now)];
 for(const [seat,uid] of ids.entries()){const profit=input.profits[seat],nextScore=assigned[seat].earnings+profit;if(!Number.isSafeInteger(profit)||!Number.isSafeInteger(nextScore))throw Error('Invalid authoritative league profit');statements.push(db.prepare('INSERT INTO league_earnings(deal,uid,season,amount,won,created) VALUES(?,?,?,?,?,?)').bind(input.deal,uid,season,profit,+(seat%2===input.winner),now),db.prepare('INSERT OR IGNORE INTO league_score_marks(season,uid,earnings,achieved) VALUES(?,?,?,?)').bind(season,uid,nextScore,now),db.prepare('UPDATE league_members SET earnings=earnings+?,wins=wins+?,matches=matches+1,achieved=(SELECT achieved FROM league_score_marks WHERE season=? AND uid=? AND earnings=?) WHERE season=? AND uid=?').bind(profit,+(seat%2===input.winner),season,uid,nextScore,season,uid));}
 for(const pair of pairs)statements.push(db.prepare('INSERT INTO league_pairs(low_uid,high_uid,day,deals) VALUES(?,?,?,1) ON CONFLICT(low_uid,high_uid,day) DO UPDATE SET deals=deals+1').bind(...pair,day));return statements;
}
export async function leagueState(db:D1Database,uid:string,tierInput?:number,groupInput?:string){const now=Date.now(),season=await advanceLeagues(db,now),{player,member}=await assign(db,uid,season,now),tier=typeof tierInput==='number'&&Number.isInteger(tierInput)&&tierInput>=0&&tierInput<5?tierInput:member.tier;
 const groups=(await db.prepare('SELECT g.id,g.number,COUNT(m.uid) count FROM league_groups g LEFT JOIN league_members m ON m.group_id=g.id WHERE g.season=? AND g.tier=? GROUP BY g.id ORDER BY g.number').bind(season,tier).all<{id:string;number:number;count:number}>()).results;
 const group=groups.find(g=>g.id===groupInput)??groups.find(g=>g.id===member.group_id)??groups[0]??null,rows=group?await ranked(db,group.id):[],{provisional,zone}=zones(rows);
 async function present(r:Member,i:number,count:number,z:number){const bot=rosterById(r.uid);if(bot)return {uid:r.uid,name:bot.name,avatar:bot.avatar,photoURL:undefined,rank:i+1,earnings:r.earnings,wins:r.wins,matches:r.matches,outcome:outcome(r.tier,i+1,count,z,r.matches)};const account=await db.prepare('SELECT name FROM accounts WHERE uid=?').bind(r.uid).first<{name:string}>(),google=await publicGoogleProfile(db,r.uid);return {uid:r.uid,name:google.displayName||publicPlayerName(account?.name||'',r.uid),avatar:await playerAvatar(db,r.uid),photoURL:google.photoURL,rank:i+1,earnings:r.earnings,wins:r.wins,matches:r.matches,outcome:outcome(r.tier,i+1,count,z,r.matches)};}
 const ownRows=group?.id===member.group_id?rows:await ranked(db,member.group_id),ownZones=zones(ownRows),ownIndex=ownRows.findIndex(r=>r.uid===uid),own=await present(ownRows[ownIndex],ownIndex,ownRows.length,ownZones.zone);
 const members=await Promise.all(rows.map((r,i)=>present(r,i,rows.length,zone))),ownGroup=(await db.prepare('SELECT number FROM league_groups WHERE id=?').bind(member.group_id).first<{number:number}>())!;
 const finish=await db.prepare('SELECT season,tier,next_tier nextTier,rank,earnings,reward,outcome,title,badge FROM league_results WHERE uid=? AND seen=0 ORDER BY season DESC LIMIT 1').bind(uid).first<LeagueFinish>();
 let distance=0,distanceLabel='Group provisional';if(!ownZones.provisional){const target=own.rank>ownRows.length-ownZones.zone&&member.tier>0?ownRows[ownRows.length-ownZones.zone-1]:own.rank>ownZones.zone?ownRows[ownZones.zone-1]:null;distance=target?Math.max(0,target.earnings-own.earnings+1):0;distanceLabel=target?(own.rank>ownRows.length-ownZones.zone&&member.tier>0?'to safety':member.tier===4?'to elite rewards':'to promotion'):(member.tier===4&&own.rank<=ownZones.zone?'Elite reward zone':own.rank<=ownZones.zone?'Promotion zone':'Safe zone');}
 if(!own.matches){distance=0;distanceLabel=ownZones.provisional?'Play a qualifying deal · provisional group':'Play a qualifying deal to advance';}
 return {activePlayers:rows.filter(r=>r.matches>0).length,season,ends:season+WEEK_MS,tier,ownTier:member.tier,highest:player.highest,group:group?.id??null,groupNumber:group?.number??null,ownGroup:member.group_id,ownGroupNumber:ownGroup.number,ownRank:own.rank,ownEarnings:own.earnings,provisional,zone,members,own,distance,distanceLabel,groups,finish,rules:LEAGUE_RULES};
}
export async function leagueAction(db:D1Database,uid:string,body:any){await ensureLeagues(db);if(body.action==='profile'){if(typeof body.target!=='string'||body.target.length>128)throw Error('Invalid league player');const member=await db.prepare('SELECT uid FROM league_members WHERE uid=? LIMIT 1').bind(body.target).first();if(!member)throw Error('League player unavailable');const profile=rosterById(body.target)?await rosterProfile(db,body.target):await publicPlayerProfile(db,body.target);if(!profile)throw Error('Player profile unavailable');return {...profile,uid:body.target};}if(body.action==='ack'&&Number.isSafeInteger(body.season)){await db.prepare('UPDATE league_results SET seen=1 WHERE uid=? AND season<=?').bind(uid,body.season).run();return {ok:true};}if(body.action==='honors'){const season=await advanceLeagues(db);const {player}=await assign(db,uid,season,Date.now());const honors=(await db.prepare("SELECT season,tier,rank,badge,title FROM league_results WHERE uid=? AND (badge<>'' OR title<>'') ORDER BY season DESC LIMIT 6").bind(uid).all()).results;return {...player,honors};}if(body.action==='tick'){await advanceLeagues(db);return {ok:true};}return leagueState(db,uid,body.tier,body.group);}

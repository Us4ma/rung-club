import {guestName,validPlayerName,publicPlayerName} from '../../packages/protocol/player-name.ts';
import {leaderboard} from './roster-store.ts';
import {playerStats} from './player-stats.ts';
import {syncGoogleProfile,publicGoogleProfile,selectGoogleAvatar} from './google-profile.ts';
import {playerAvatar} from './avatar-profile.ts';
import {validAvatar} from '../../packages/protocol/avatars.ts';
import {bandEligible,tutorialCode,tutorialStatus,tutorialTransition,type TutorialStatus} from '../../packages/protocol/progression.ts';
/** Narrow bearer-authenticated profile bridge for the browser and Android client. */
interface Statement {bind(...values:unknown[]):Statement;first<T=Record<string,unknown>>():Promise<T|null>;all():Promise<{results:unknown[]}>;run():Promise<unknown>}
export interface IdentityDatabase {prepare(sql:string):Statement;batch?(statements:any[]):Promise<unknown>}
export type VerifiedIdentity={uid:string;authTime:number;anonymous?:boolean;google?:boolean;name?:unknown;picture?:unknown};
export const validUsername=validPlayerName;
export function identityOrigin(req:Request,allowed:string){const origin=req.headers.get('Origin');return !origin||origin===new URL(req.url).origin||origin===allowed||origin==='https://localhost'||origin==='https://rung-club.vercel.app'||origin==='https://rung-club.sammyqamar.workers.dev';}
export async function identityResponse(req:Request,db:IdentityDatabase,verify:(token:string)=>Promise<VerifiedIdentity>,allowed:string,economy:boolean,tableProfile?:(viewer:string,code:string,seat:number)=>Promise<Response>){
 const origin=req.headers.get('Origin');const headers:Record<string,string>={'Cache-Control':'no-store','Vary':'Origin'};
 const reply=(data:unknown,status=200)=>Response.json(data,{status,headers});
 if(!identityOrigin(req,allowed))return reply({error:'Origin denied'},403);
 if(origin)headers['Access-Control-Allow-Origin']=origin;
 if(req.method==='OPTIONS'){headers['Access-Control-Allow-Methods']='GET, PATCH, DELETE';headers['Access-Control-Allow-Headers']='Authorization, Content-Type';return new Response(null,{status:204,headers});}
 if(!['GET','PATCH','DELETE'].includes(req.method))return reply({error:'Method not allowed'},405);
 let identity:VerifiedIdentity;
 try{const token=req.headers.get('Authorization')?.match(/^Bearer (\S+)$/)?.[1];if(!token||token.length>5000)throw Error();identity=await verify(token);if(!identity.uid||!Number.isFinite(identity.authTime))throw Error();}catch{return reply({error:'Please sign in again.'},401);}
 const existing=await db.prepare('SELECT name,deleted,revoked_before,tutorial,created FROM accounts WHERE uid=?').bind(identity.uid).first<{name:string;deleted:number;revoked_before:number;tutorial:number;created:number}>();
 if(req.method==='DELETE'){
  const text=await req.text();if(text.length>4096)return reply({error:'Payload too large'},413);
  let confirmation:unknown;try{confirmation=JSON.parse(text).confirmation;}catch{return reply({error:'Invalid request'},400);}
  if(confirmation!=='DELETE')return reply({error:'Type DELETE to confirm account deletion.'},400);
  if(!identity.anonymous&&Date.now()-identity.authTime>300000)return reply({error:'Confirm your sign-in again before deleting this account.'},403);
  if(existing?.deleted)return reply({deleted:true});
  if(existing&&identity.authTime<=existing.revoked_before)return reply({error:'Account revoked'},401);
  if(!db.batch)return reply({error:'Account deletion is unavailable. Please retry later.'},503);
  try{const now=Date.now();await db.batch([
   db.prepare('INSERT INTO accounts(uid,name,created,deleted,revoked_before,tutorial) VALUES(?,?,?,1,?,0) ON CONFLICT(uid) DO UPDATE SET name=excluded.name,deleted=1,revoked_before=excluded.revoked_before,tutorial=0').bind(identity.uid,'Deleted-'+identity.uid,now,now),
   ...['sessions','results','ledger','cosmetics'].map(table=>db.prepare(`DELETE FROM ${table} WHERE uid=?`).bind(identity.uid))
  ]);}catch{return reply({error:'Unable to delete account. Your request can be retried.'},503);}
  return reply({deleted:true});
 }
 if(existing?.deleted||existing&&identity.authTime<=existing.revoked_before)return reply({error:'Account revoked'},401);
 if(req.method==='GET'&&new URL(req.url).searchParams.has('leaderboard'))return reply(await leaderboard(db));
 if(req.method==='GET'&&new URL(req.url).searchParams.has('tableProfile')){const params=new URL(req.url).searchParams,code=params.get('tableProfile')||'',seat=params.get('seat')||'';if(!/^[A-F0-9]{8}$/.test(code)||! /^[0-3]$/.test(seat))return reply({error:'Invalid table or seat'},400);if(!tableProfile)return reply({error:'Player profiles are unavailable'},503);const response=await tableProfile(identity.uid,code,Number(seat));return reply(await response.json(),response.status);}
 if(req.method==='PATCH'){
  const text=await req.text();if(text.length>4096)return reply({error:'Payload too large'},413);
  let name:unknown,status:unknown,unlock:unknown,avatar:unknown,avatarSource:unknown;try{const data=JSON.parse(text);name=data.name;status=data.tutorialStatus;unlock=data.bandUnlockSeen;avatar=data.avatar;avatarSource=data.avatarSource;}catch{return reply({error:'Invalid request'},400);}
  if(avatar!==undefined&&!validAvatar(avatar))return reply({error:"Invalid avatar"},400);if(avatarSource!==undefined&&avatarSource!=='google')return reply({error:'Invalid avatar source'},400);if(name===undefined&&status===undefined&&unlock!==true&&avatar===undefined&&avatarSource===undefined)return reply({error:'Empty update'},400);if(status!==undefined&&!(typeof status==='string'&&Object.hasOwn(tutorialCode,status)))return reply({error:'Invalid tutorial status'},400);if(name!==undefined&&!validUsername(name))return reply({error:'Use 3–40 letters, numbers, spaces or simple punctuation. Guest and Deleted are reserved.'},400);
  try{if(name!==undefined)await db.prepare('INSERT INTO accounts(uid,name,created,tutorial) VALUES(?,?,?,4) ON CONFLICT(uid) DO UPDATE SET name=excluded.name WHERE accounts.deleted=0').bind(identity.uid,name,Date.now()).run();else if(!existing)await db.prepare('INSERT OR IGNORE INTO accounts(uid,name,created,tutorial) VALUES(?,?,?,4)').bind(identity.uid,'Guest-'+identity.uid,Date.now()).run();if(unlock===true){const total=await db.prepare('SELECT COALESCE(SUM(xp),0) xp FROM ledger WHERE uid=?').bind(identity.uid).first<{xp:number}>();if(!bandEligible(total?.xp||0))return reply({error:'Band Rung unlocks at Level 5'},403);await db.prepare('INSERT OR IGNORE INTO cosmetics(uid,item) VALUES(?,?)').bind(identity.uid,'event:band-unlock-seen').run();}if(status!==undefined)await db.prepare('UPDATE accounts SET tutorial=CASE WHEN tutorial IN (0,1,3) THEN tutorial ELSE ? END WHERE uid=? AND deleted=0').bind(tutorialCode[status as TutorialStatus],identity.uid).run();}
  catch(e){if(/UNIQUE constraint failed: accounts.name/i.test(String(e)))return reply({error:'That name is taken. Try another.'},409);return reply({error:'Unable to save your name. Please retry.'},503);}
  if(name!==undefined)await db.prepare('DELETE FROM cosmetics WHERE uid=? AND item=?').bind(identity.uid,'profile:google-name-default').run();if(avatar!==undefined)await playerAvatar(db,identity.uid,avatar as number);if(avatarSource==='google'){await syncGoogleProfile(db,identity);await selectGoogleAvatar(db,identity.uid);}
 }else if(!existing){await db.prepare('INSERT OR IGNORE INTO accounts(uid,name,created,tutorial) VALUES(?,?,?,4)').bind(identity.uid,'Guest-'+identity.uid,Date.now()).run();}
 await syncGoogleProfile(db,identity);
 if(identity.anonymous)await db.prepare("UPDATE accounts SET name=? WHERE uid=? AND name LIKE 'Guest-%'").bind(guestName(identity.uid),identity.uid).run();
 const google=await publicGoogleProfile(db,identity.uid);
 const user=await db.prepare('SELECT uid,name,tutorial FROM accounts WHERE uid=? AND deleted=0').bind(identity.uid).first<{uid:string;name:string;tutorial:number}>();
 const totals=await db.prepare('SELECT COALESCE(SUM(amount),0) tokens,COALESCE(SUM(xp),0) xp FROM ledger WHERE uid=?').bind(identity.uid).first();
 const stats=await playerStats(db,identity.uid);
 const history=await db.prepare('SELECT * FROM results WHERE uid=? ORDER BY created DESC LIMIT 30').bind(identity.uid).all();
 const owned=await db.prepare('SELECT item FROM cosmetics WHERE uid=?').bind(identity.uid).all();
 const legacy=Number(new URL(req.url).searchParams.get('legacyAvatar'));const avatar=await playerAvatar(db,identity.uid,undefined,existing&&existing.created<Date.UTC(2026,9,14,4)?legacy:undefined);
 return reply({avatar,googlePhotoURL:google.googlePhotoURL,user:user?{uid:user.uid,name:google.displayName||publicPlayerName(user.name,user.uid),username:user.name,photoURL:google.photoURL}:null,tutorialStatus:tutorialStatus(user?.tutorial??0),totals,stats,history:history.results,owned:owned.results,bandUnlockSeen:owned.results.some(item=>(item as {item:string}).item==='event:band-unlock-seen'),economy});
}

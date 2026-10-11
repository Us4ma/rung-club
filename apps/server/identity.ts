import {bandEligible,tutorialCode,tutorialStatus,tutorialTransition,type TutorialStatus} from '../../packages/protocol/progression.ts';
/** Narrow bearer-authenticated profile bridge for the browser and Android client. */
interface Statement {bind(...values:unknown[]):Statement;first<T=Record<string,unknown>>():Promise<T|null>;all():Promise<{results:unknown[]}>;run():Promise<unknown>}
export interface IdentityDatabase {prepare(sql:string):Statement}
export type VerifiedIdentity={uid:string;authTime:number};
export const validUsername=(name:unknown):name is string=>typeof name==='string'&&/^[A-Za-z0-9_]{3,20}$/.test(name)&&!/^(guest|deleted)(_|$)/i.test(name);
export function identityOrigin(req:Request,allowed:string){const origin=req.headers.get('Origin');return !origin||origin===new URL(req.url).origin||origin===allowed||origin==='https://localhost'||origin==='https://rung-club.vercel.app'||origin==='https://rung-club.sammyqamar.workers.dev';}
export async function identityResponse(req:Request,db:IdentityDatabase,verify:(token:string)=>Promise<VerifiedIdentity>,allowed:string,economy:boolean){
 const origin=req.headers.get('Origin');const headers:Record<string,string>={'Cache-Control':'no-store','Vary':'Origin'};
 const reply=(data:unknown,status=200)=>Response.json(data,{status,headers});
 if(!identityOrigin(req,allowed))return reply({error:'Origin denied'},403);
 if(origin)headers['Access-Control-Allow-Origin']=origin;
 if(req.method==='OPTIONS'){headers['Access-Control-Allow-Methods']='GET, PATCH';headers['Access-Control-Allow-Headers']='Authorization, Content-Type';return new Response(null,{status:204,headers});}
 if(!['GET','PATCH'].includes(req.method))return reply({error:'Method not allowed'},405);
 let identity:VerifiedIdentity;
 try{const token=req.headers.get('Authorization')?.match(/^Bearer (\S+)$/)?.[1];if(!token||token.length>5000)throw Error();identity=await verify(token);if(!identity.uid||!Number.isFinite(identity.authTime))throw Error();}catch{return reply({error:'Please sign in again.'},401);}
 const existing=await db.prepare('SELECT name,deleted,revoked_before,tutorial FROM accounts WHERE uid=?').bind(identity.uid).first<{name:string;deleted:number;revoked_before:number;tutorial:number}>();
 if(existing?.deleted||existing&&identity.authTime<=existing.revoked_before)return reply({error:'Account revoked'},401);
 if(req.method==='PATCH'){
  const text=await req.text();if(text.length>4096)return reply({error:'Payload too large'},413);
  let name:unknown,status:unknown,unlock:unknown;try{const data=JSON.parse(text);name=data.name;status=data.tutorialStatus;unlock=data.bandUnlockSeen;}catch{return reply({error:'Invalid request'},400);}
  if(name===undefined&&status===undefined&&unlock!==true)return reply({error:'Empty update'},400);if(status!==undefined&&!(typeof status==='string'&&Object.hasOwn(tutorialCode,status)))return reply({error:'Invalid tutorial status'},400);if(name!==undefined&&!validUsername(name))return reply({error:'Use 3–20 letters, numbers or underscores. Guest and Deleted are reserved.'},400);
  try{if(name!==undefined)await db.prepare('INSERT INTO accounts(uid,name,created,tutorial) VALUES(?,?,?,4) ON CONFLICT(uid) DO UPDATE SET name=excluded.name WHERE accounts.deleted=0').bind(identity.uid,name,Date.now()).run();else if(!existing)await db.prepare('INSERT OR IGNORE INTO accounts(uid,name,created,tutorial) VALUES(?,?,?,4)').bind(identity.uid,'Guest-'+identity.uid,Date.now()).run();if(unlock===true){const total=await db.prepare('SELECT COALESCE(SUM(xp),0) xp FROM ledger WHERE uid=?').bind(identity.uid).first<{xp:number}>();if(!bandEligible(total?.xp||0))return reply({error:'Band Rung unlocks at Level 5'},403);await db.prepare('INSERT OR IGNORE INTO cosmetics(uid,item) VALUES(?,?)').bind(identity.uid,'event:band-unlock-seen').run();}if(status!==undefined)await db.prepare('UPDATE accounts SET tutorial=CASE WHEN tutorial IN (0,1,3) THEN tutorial ELSE ? END WHERE uid=? AND deleted=0').bind(tutorialCode[status as TutorialStatus],identity.uid).run();}
  catch(e){if(/UNIQUE constraint failed: accounts.name/i.test(String(e)))return reply({error:'That username is taken. Try another.'},409);return reply({error:'Unable to save your username. Please retry.'},503);}
 }else if(!existing){await db.prepare('INSERT OR IGNORE INTO accounts(uid,name,created,tutorial) VALUES(?,?,?,4)').bind(identity.uid,'Guest-'+identity.uid,Date.now()).run();}
 const user=await db.prepare('SELECT uid,name,tutorial FROM accounts WHERE uid=? AND deleted=0').bind(identity.uid).first<{uid:string;name:string;tutorial:number}>();
 const totals=await db.prepare('SELECT COALESCE(SUM(amount),0) tokens,COALESCE(SUM(xp),0) xp FROM ledger WHERE uid=?').bind(identity.uid).first();
 const stats=await db.prepare('SELECT COUNT(*) matches,COALESCE(SUM(won),0) wins FROM results WHERE uid=?').bind(identity.uid).first();
 const history=await db.prepare('SELECT * FROM results WHERE uid=? ORDER BY created DESC LIMIT 30').bind(identity.uid).all();
 const owned=await db.prepare('SELECT item FROM cosmetics WHERE uid=?').bind(identity.uid).all();
 return reply({user:user?{uid:user.uid,name:user.name}:null,tutorialStatus:tutorialStatus(user?.tutorial??0),totals,stats,history:history.results,owned:owned.results,bandUnlockSeen:owned.results.some(item=>(item as {item:string}).item==='event:band-unlock-seen'),economy});
}

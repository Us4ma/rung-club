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
 const existing=await db.prepare('SELECT name,deleted,revoked_before FROM accounts WHERE uid=?').bind(identity.uid).first<{name:string;deleted:number;revoked_before:number}>();
 if(existing?.deleted||existing&&identity.authTime<=existing.revoked_before)return reply({error:'Account revoked'},401);
 if(req.method==='PATCH'){
  const text=await req.text();if(text.length>4096)return reply({error:'Payload too large'},413);
  let name:unknown;try{name=JSON.parse(text).name;}catch{return reply({error:'Invalid request'},400);}
  if(!validUsername(name))return reply({error:'Use 3–20 letters, numbers or underscores. Guest and Deleted are reserved.'},400);
  try{await db.prepare('INSERT INTO accounts(uid,name,created) VALUES(?,?,?) ON CONFLICT(uid) DO UPDATE SET name=excluded.name WHERE accounts.deleted=0').bind(identity.uid,name,Date.now()).run();}
  catch(e){if(/UNIQUE constraint failed: accounts.name/i.test(String(e)))return reply({error:'That username is taken. Try another.'},409);return reply({error:'Unable to save your username. Please retry.'},503);}
 }else if(!existing){await db.prepare('INSERT OR IGNORE INTO accounts(uid,name,created) VALUES(?,?,?)').bind(identity.uid,'Guest-'+identity.uid,Date.now()).run();}
 const user=await db.prepare('SELECT uid,name FROM accounts WHERE uid=? AND deleted=0').bind(identity.uid).first();
 const totals=await db.prepare('SELECT COALESCE(SUM(amount),0) tokens,COALESCE(SUM(xp),0) xp FROM ledger WHERE uid=?').bind(identity.uid).first();
 const stats=await db.prepare('SELECT COUNT(*) matches,COALESCE(SUM(won),0) wins FROM results WHERE uid=?').bind(identity.uid).first();
 const history=await db.prepare('SELECT * FROM results WHERE uid=? ORDER BY created DESC LIMIT 30').bind(identity.uid).all();
 const owned=await db.prepare('SELECT item FROM cosmetics WHERE uid=?').bind(identity.uid).all();
 return reply({user,totals,stats,history:history.results,owned:owned.results,economy});
}

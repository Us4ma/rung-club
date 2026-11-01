import {levelProgress} from '../../packages/protocol/progression.ts';
import {MILESTONES,rewardCoins,rewardID,rewardXP} from '../../packages/protocol/level-rewards.ts';
/** Runs in the existing serialized economy coordinator; ledger IDs also enforce idempotency. */
export async function levelRewards(db:D1Database,uid:string,input:any){
 const account=await db.prepare('SELECT uid FROM accounts WHERE uid=? AND deleted=0').bind(uid).first();
 if(!account)return Response.json({error:'Account unavailable.'},{status:403});
 const totals=await db.prepare('SELECT COALESCE(SUM(xp),0) xp FROM ledger WHERE uid=?').bind(uid).first<{xp:number}>();
 const xp=Number(totals?.xp||0),level=levelProgress(xp).level;
 const action=input?.action||'state';
 if(!['state','claim','claim-all','equip'].includes(action))return Response.json({error:'Unknown rewards action.'},{status:400});
 if(action==='claim'||action==='claim-all'){
  if(action==='claim'&&(!Number.isInteger(input.level)||input.level<1||input.level>level))return Response.json({error:'Reach this level before claiming its reward.'},{status:409});
  const levels=action==='claim'?[input.level]:Array.from({length:level},(_,i)=>i+1);
  const statements:D1PreparedStatement[]=[];
  for(const n of levels){const id=rewardID(uid,n);statements.push(db.prepare("INSERT OR IGNORE INTO ledger(id,uid,amount,xp,kind,created) SELECT ?,?,?,0,'level-reward',? WHERE EXISTS(SELECT 1 FROM accounts WHERE uid=? AND deleted=0) AND (SELECT COALESCE(SUM(xp),0) FROM ledger WHERE uid=?)>=?").bind(id,uid,rewardCoins(n),Date.now(),uid,uid,rewardXP(n)));
   const special=MILESTONES.find(m=>m.level===n);if(special)statements.push(db.prepare('INSERT OR IGNORE INTO cosmetics(uid,item) SELECT ?,? WHERE EXISTS(SELECT 1 FROM ledger WHERE id=? AND uid=?)').bind(uid,special.item,id,uid));
  }
  await db.batch(statements);
 }
 if(action==='equip'){
  const item=input.item;
  if(item!==''&&!MILESTONES.some(m=>m.kind==='frame'&&m.item===item))return Response.json({error:'Unknown frame.'},{status:400});
  if(item&&!await db.prepare('SELECT item FROM cosmetics WHERE uid=? AND item=?').bind(uid,item).first())return Response.json({error:'Claim this frame before equipping it.'},{status:403});
  await db.batch([db.prepare("DELETE FROM cosmetics WHERE uid=? AND item LIKE 'equipped:frame:%'").bind(uid),...(item?[db.prepare('INSERT OR IGNORE INTO cosmetics(uid,item) SELECT ?,? WHERE EXISTS(SELECT 1 FROM cosmetics WHERE uid=? AND item=?)').bind(uid,'equipped:'+item,uid,item)]:[])]);
 }
 const claimed=await db.prepare("SELECT id FROM ledger WHERE uid=? AND kind='level-reward'").bind(uid).all<{id:string}>();
 const owned=await db.prepare('SELECT item FROM cosmetics WHERE uid=?').bind(uid).all<{item:string}>();
 const wallet=await db.prepare('SELECT COALESCE(SUM(amount),0) balance FROM ledger WHERE uid=?').bind(uid).first<{balance:number}>();
 return Response.json({level,xp,claimed:claimed.results.filter(r=>r.id.startsWith(`level-reward:v1:${uid}:`)).map(r=>Number(r.id.split(':').at(-1))),owned:owned.results.map(r=>r.item),equipped:owned.results.find(r=>r.item.startsWith('equipped:frame:'))?.item.slice(9)||'',wallet:Number(wallet?.balance||0)},{headers:{'Cache-Control':'no-store'}});
}

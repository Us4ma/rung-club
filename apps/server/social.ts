import {FRIEND_REQUEST_TTL,FRIEND_INVITE_MS,type FriendRelation,type SocialPlayer,type GameInvite,type SocialAction,type FriendsState} from '../../packages/protocol/friends.ts';
import {levelProgress,bandEligible} from '../../packages/protocol/progression.ts';
import {publicPlayerName} from '../../packages/protocol/player-name.ts';
import {publicGoogleProfile} from './google-profile.ts';
import {playerAvatar} from './avatar-profile.ts';
export type SocialEnv={DB:D1Database;ROOMS:DurableObjectNamespace};
const schema=[
 `CREATE TABLE IF NOT EXISTS friendships(low_uid TEXT NOT NULL REFERENCES accounts(uid),high_uid TEXT NOT NULL REFERENCES accounts(uid),requester TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('pending','accepted','declined','cancelled','expired')),created INTEGER NOT NULL,updated INTEGER NOT NULL,expires INTEGER NOT NULL,PRIMARY KEY(low_uid,high_uid),CHECK(low_uid<high_uid))`,
 `CREATE INDEX IF NOT EXISTS friendships_high ON friendships(high_uid,status)`,
 `CREATE TABLE IF NOT EXISTS friend_invites(id TEXT PRIMARY KEY,sender TEXT NOT NULL REFERENCES accounts(uid),target TEXT NOT NULL REFERENCES accounts(uid),room TEXT NOT NULL,mode TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('pending','scheduled','joined','declined','expired','cancelled','failed')),created INTEGER NOT NULL,expires INTEGER NOT NULL,changed INTEGER NOT NULL,reason TEXT NOT NULL DEFAULT '')`,
 `CREATE UNIQUE INDEX IF NOT EXISTS friend_invite_pending ON friend_invites(sender,target) WHERE status IN ('pending','scheduled')`,
 `CREATE INDEX IF NOT EXISTS friend_invite_inbox ON friend_invites(target,status,expires)`,
 `CREATE INDEX IF NOT EXISTS friend_invite_outbox ON friend_invites(sender,changed)`
];
const ready=new WeakMap<object,Promise<unknown>>();
export function ensureSocialSchema(db:D1Database){let promise=ready.get(db);if(!promise){promise=db.batch(schema.map(sql=>db.prepare(sql))).catch(e=>{ready.delete(db);throw e;});ready.set(db,promise);}return promise;}
export async function socialRPC(env:SocialEnv,key:string,path:string,uid:string,body?:unknown){return env.ROOMS.get(env.ROOMS.idFromName(key)).fetch(new Request('https://internal/'+path,{method:'POST',headers:{'X-User-ID':uid,'Content-Type':'application/json'},body:JSON.stringify(body??{})}));}
export async function notifySocial(env:SocialEnv,...uids:string[]){await Promise.all([...new Set(uids)].map(uid=>socialRPC(env,'__device:'+uid,'social-notify',uid).catch(()=>null)));}
const pair=(a:string,b:string)=>a<b?[a,b]:[b,a];
export async function friendRelation(db:D1Database,viewer:string,target:string):Promise<FriendRelation>{
 if(viewer===target)return {status:'self'};await ensureSocialSchema(db);const [low,high]=pair(viewer,target);
 const row=await db.prepare('SELECT requester,status,updated,expires FROM friendships WHERE low_uid=? AND high_uid=?').bind(low,high).first<{requester:string;status:string;updated:number;expires:number}>();
 if(row?.status==='accepted')return {status:'friends'};
 if(row?.status==='pending'&&row.expires>Date.now())return {status:row.requester===viewer?'sent':'incoming',updated:row.updated,canResend:false};return {status:'none',canResend:true};
}
type Presence={online:boolean;playing:boolean;room?:string;table?:{member?:boolean;started?:boolean;mode?:'open'|'band';phase?:string;teammateAvailable?:boolean;host?:boolean}};
export async function socialPresence(env:SocialEnv,uid:string):Promise<Presence>{
 const response=await socialRPC(env,'__device:'+uid,'device-presence',uid);const lease=await response.json<{online:boolean;room?:string}>();
 if(!lease.online)return {online:false,playing:false};if(!lease.room)return {online:true,playing:false};
 const responseRoom=await socialRPC(env,lease.room,'social-status',uid);const room=await responseRoom.json<{member?:boolean;started?:boolean;mode?:'open'|'band';phase?:string;code?:string;teammateAvailable?:boolean;host?:boolean}>();
 return {online:true,playing:!!room.member&&!!room.started,...(room.member?{room:lease.room,table:room}:{})};
}
export async function socialPlayer(env:SocialEnv,uid:string):Promise<SocialPlayer|null>{
 const account=await env.DB.prepare('SELECT name FROM accounts WHERE uid=? AND deleted=0').bind(uid).first<{name:string}>();if(!account)return null;
 const [google,avatar,total,presence]=await Promise.all([publicGoogleProfile(env.DB,uid),playerAvatar(env.DB,uid),env.DB.prepare('SELECT COALESCE(SUM(xp),0) xp FROM ledger WHERE uid=?').bind(uid).first<{xp:number}>(),socialPresence(env,uid)]);
 return {uid,name:google.displayName||publicPlayerName(account.name,uid),avatar,photoURL:google.photoURL,level:levelProgress(total?.xp||0).level,online:presence.online,playing:presence.playing};
}
type Edge={low_uid:string;high_uid:string;requester:string;status:string;updated:number;expires:number};
type InviteRow={id:string;sender:string;target:string;room:string;mode:'open'|'band';status:GameInvite['status'];created:number;expires:number;changed:number;reason:string};
async function expireSocial(db:D1Database,uid:string){const now=Date.now();await db.batch([db.prepare("UPDATE friendships SET status='expired' WHERE status='pending' AND expires<=? AND (low_uid=? OR high_uid=?)").bind(now,uid,uid),db.prepare("UPDATE friend_invites SET status='expired',changed=? WHERE status='pending' AND expires<=? AND (sender=? OR target=?)").bind(now,now,uid,uid)]);}
export async function friendsState(env:SocialEnv,uid:string):Promise<FriendsState>{
 await ensureSocialSchema(env.DB);await expireSocial(env.DB,uid);const now=Date.now();
 const [edges,invites]=await Promise.all([env.DB.prepare("SELECT f.* FROM friendships f JOIN accounts a ON a.uid=f.low_uid JOIN accounts b ON b.uid=f.high_uid WHERE (f.low_uid=? OR f.high_uid=?) AND f.status IN ('accepted','pending') AND a.deleted=0 AND b.deleted=0 LIMIT 300").bind(uid,uid).all<Edge>(),env.DB.prepare("SELECT i.* FROM friend_invites i JOIN accounts a ON a.uid=i.sender JOIN accounts b ON b.uid=i.target WHERE (i.sender=? OR i.target=?) AND a.deleted=0 AND b.deleted=0 AND (i.status IN ('pending','scheduled') OR i.changed>?) ORDER BY i.created DESC LIMIT 30").bind(uid,uid,now-120000).all<InviteRow>()]);
 const ids=new Set<string>();for(const e of edges.results)ids.add(e.low_uid===uid?e.high_uid:e.low_uid);for(const i of invites.results){ids.add(i.sender);ids.add(i.target);}
 const profiles=new Map<string,SocialPlayer>();await Promise.all([...ids].map(async id=>{const player=await socialPlayer(env,id);if(player)profiles.set(id,player);}));
 const friends:SocialPlayer[]=[],incoming:FriendsState['incoming']=[],sent:FriendsState['sent']=[];
 for(const e of edges.results){const player=profiles.get(e.low_uid===uid?e.high_uid:e.low_uid);if(!player)continue;if(e.status==='accepted')friends.push(player);else(e.requester===uid?sent:incoming).push({player,updated:e.updated,expires:e.expires,canResend:false});}
 friends.sort((a,b)=>Number(b.online)-Number(a.online)||Number(a.playing)-Number(b.playing)||a.name.localeCompare(b.name));
 return {friends,incoming,sent,invites:invites.results.flatMap(i=>{const sender=profiles.get(i.sender),target=profiles.get(i.target);return sender&&target?[{id:i.id,sender,target,mode:i.mode,status:i.status,expires:i.expires,changed:i.changed,reason:i.reason,...((i.sender===uid||i.status==='joined')?{room:i.room}:{})}]:[];}),serverNow:now};
}
const failure=(message:string,status=409,code?:string)=>Response.json({error:message,code},{status});
async function activeInvite(env:SocialEnv,uid:string,id:string){return env.DB.prepare('SELECT * FROM friend_invites WHERE id=? AND (sender=? OR target=?)').bind(id,uid,uid).first<InviteRow>();}
async function setRoom(env:SocialEnv,uid:string,code:string){await socialRPC(env,'__device:'+uid,'social-room',uid,{room:code});}
/** Executed by the existing Durable Object, serialized with other social commands. */
export async function socialAction(env:SocialEnv,uid:string,input:SocialAction):Promise<Response>{
 if(!input||typeof input.action!=='string')return failure('Invalid friends action.',400);
 await ensureSocialSchema(env.DB);await expireSocial(env.DB,uid);const now=Date.now();
 if(['request','accept-request','decline-request','cancel-request','remove-friend'].includes(input.action)){
  const target=String(input.target||'');if(!target||target.length>128||target===uid)return failure('Choose another player.',400);
  if(!await env.DB.prepare('SELECT uid FROM accounts WHERE uid=? AND deleted=0').bind(target).first())return failure('That player is unavailable.',404);
  const [low,high]=pair(uid,target);let relation=await friendRelation(env.DB,uid,target),changed=true;
  if(input.action==='request'){
   if(relation.status==='sent'||relation.status==='friends')return Response.json({relationship:relation});
   const recent=await env.DB.prepare('SELECT COUNT(*) n FROM friendships WHERE requester=? AND updated>?').bind(uid,now-60000).first<{n:number}>();if((recent?.n||0)>=5)return failure('Please wait before adding more players.',429);
   const inbox=await env.DB.prepare("SELECT COUNT(*) n FROM friendships WHERE (low_uid=? OR high_uid=?) AND status IN ('accepted','pending')").bind(target,target).first<{n:number}>();if((inbox?.n||0)>=200&&relation.status!=='incoming')return failure('This player’s friends list is full.');
   const cap=await env.DB.prepare("SELECT COUNT(*) n FROM friendships WHERE (low_uid=? OR high_uid=?) AND status IN ('accepted','pending')").bind(uid,uid).first<{n:number}>();if((cap?.n||0)>=200)return failure('Your friends list is full.');
   const written=await env.DB.prepare(`INSERT INTO friendships(low_uid,high_uid,requester,status,created,updated,expires) VALUES(?,?,?,'pending',?,?,?) ON CONFLICT(low_uid,high_uid) DO UPDATE SET status=CASE WHEN friendships.status='pending' AND friendships.requester<>excluded.requester AND friendships.expires>? THEN 'accepted' ELSE 'pending' END,requester=excluded.requester,updated=excluded.updated,expires=excluded.expires WHERE friendships.status<>'accepted'`).bind(low,high,uid,now,now,now+FRIEND_REQUEST_TTL,now).run();changed=!!written.meta.changes;
   relation=await friendRelation(env.DB,uid,target);if(relation.status==='none')return failure('Unable to send this friend request. Please retry.');
  }else if(input.action==='accept-request')await env.DB.prepare("UPDATE friendships SET status='accepted',updated=? WHERE low_uid=? AND high_uid=? AND status='pending' AND requester=? AND expires>?").bind(now,low,high,target,now).run();
  else if(input.action==='decline-request')await env.DB.prepare("UPDATE friendships SET status='declined',updated=? WHERE low_uid=? AND high_uid=? AND status='pending' AND requester=?").bind(now,low,high,target).run();
  else if(input.action==='cancel-request')await env.DB.prepare("UPDATE friendships SET status='cancelled',updated=? WHERE low_uid=? AND high_uid=? AND status='pending' AND requester=?").bind(now,low,high,uid).run();
  else await env.DB.prepare("UPDATE friendships SET status='cancelled',updated=? WHERE low_uid=? AND high_uid=? AND status='accepted'").bind(now,low,high).run();
  if(input.action==='remove-friend'){const open=await env.DB.prepare("SELECT * FROM friend_invites WHERE ((sender=? AND target=?) OR (sender=? AND target=?)) AND status IN ('pending','scheduled')").bind(uid,target,target,uid).all<InviteRow>();for(const i of open.results){await env.DB.prepare("UPDATE friend_invites SET status='cancelled',changed=? WHERE id=? AND status IN ('pending','scheduled')").bind(now,i.id).run();await socialRPC(env,i.room,'friend-cancel',i.sender,{id:i.id});}}
  if(changed)await notifySocial(env,uid,target);return Response.json({relationship:await friendRelation(env.DB,uid,target)});
 }
 if(input.action==='invite'){
  const target=String(input.target||'');if(target===uid||(await friendRelation(env.DB,uid,target)).status!=='friends')return failure('Only accepted friends can be invited.',403);
  const old=await env.DB.prepare("SELECT id FROM friend_invites WHERE sender=? AND target=? AND status IN ('pending','scheduled')").bind(uid,target).first<{id:string}>();if(old)return Response.json({id:old.id,pending:true});
  if(await env.DB.prepare("SELECT id FROM friend_invites WHERE sender=? AND status IN ('pending','scheduled')").bind(uid).first())return failure('Cancel your current invitation before sending another.');
  const recent=await env.DB.prepare('SELECT COUNT(*) n FROM friend_invites WHERE sender=? AND created>?').bind(uid,now-60000).first<{n:number}>();if((recent?.n||0)>=5)return failure('Please wait before sending another invitation.',429);
  const [from,to]=await Promise.all([socialPresence(env,uid),socialPresence(env,target)]);if(!to.online)return failure('Your friend is offline.');if(to.playing)return failure('Your friend is playing a deal. Try again when they are available.');
  const targetPending=await env.DB.prepare("SELECT id FROM friend_invites WHERE target=? AND (status='scheduled' OR (status='joined' AND changed>?))").bind(target,now-30000).first();if(targetPending)return failure('Your friend is already joining a table.');
  let code=from.room,mode: 'open'|'band'=from.table?.mode||(input.mode==='band'?'band':'open'),fresh=false;
  if(from.playing&&input.newMatch&&from.table?.phase!=='finished')return failure('A new match can be invited after this deal finishes.',409,'NEW_MATCH_AT_BOUNDARY');
  if(from.room&&!input.newMatch&&!from.table?.teammateAvailable)return failure('Both team seats are occupied. Invite your friend to a new match after this deal.',409,'TEAM_FULL');
  if(mode==='band')for(const id of [uid,target]){const total=await env.DB.prepare('SELECT COALESCE(SUM(xp),0) xp FROM ledger WHERE uid=?').bind(id).first<{xp:number}>();if(!bandEligible(total?.xp||0))return failure('Both players need Level 5 for Band Rung.');}
  const id=crypto.randomUUID();if(!code||input.newMatch){code=crypto.randomUUID().replaceAll('-','').slice(0,8).toUpperCase();fresh=true;const player=await socialPlayer(env,uid);const created=await socialRPC(env,code,'init',uid,{mode,code,casualQuick:true,friendHoldUntil:now+FRIEND_INVITE_MS,ownerName:player?.name,ownerAvatar:player?.avatar,ownerPhoto:player?.photoURL});if(!created.ok)return failure('Unable to prepare your friend table.');}
  const reserved=await socialRPC(env,code,'friend-reserve',uid,{id,target,expires:now+FRIEND_INVITE_MS,fresh});if(!reserved.ok){const error=await reserved.json<{error:string;code?:string}>();return failure(error.error,409,error.code);}
  await env.DB.prepare("INSERT INTO friend_invites(id,sender,target,room,mode,status,created,expires,changed) VALUES(?,?,?,?,?,'pending',?,?,?)").bind(id,uid,target,code,mode,now,now+FRIEND_INVITE_MS,now).run();if(fresh&&input.newMatch){if(from.room){const left=await socialRPC(env,from.room,'friend-leave',uid);if(!left.ok){await env.DB.prepare("UPDATE friend_invites SET status='cancelled',changed=? WHERE id=?").bind(now,id).run();await socialRPC(env,code,'friend-cancel',uid,{id});return failure('Finish this deal before moving to a new match.');}}await setRoom(env,uid,code);}
  await notifySocial(env,uid,target);return Response.json({id,room:code,expires:now+FRIEND_INVITE_MS});
 }
 if(typeof input.id!=='string'||!input.id||input.id.length>128)return failure('Invitation missing.',400);const invite=await activeInvite(env,uid,input.id);if(!invite)return failure('Invitation unavailable.',404);
 if(input.action==='accept-invite'){
  if(invite.target!==uid)return failure('This invitation belongs to another player.',403);
  if(invite.status==='joined')return Response.json({status:'joined',room:invite.room});
  if(!['pending','scheduled'].includes(invite.status)||invite.status==='pending'&&invite.expires<=now)return failure('This invitation has expired.');
  if((await friendRelation(env.DB,uid,invite.sender)).status!=='friends')return failure('This friendship is no longer available.');
  const [target,sender]=await Promise.all([socialPresence(env,uid),socialPresence(env,invite.sender)]);if(!sender.online)return failure('Your friend is no longer online.');if(sender.playing&&sender.room!==invite.room)return failure('Your friend started another game.');if(target.playing&&target.room!==invite.room)return failure('Finish your current deal before joining.');
  const claimed=await env.DB.prepare("SELECT id FROM friend_invites WHERE target=? AND id<>? AND (status='scheduled' OR (status='joined' AND changed>?))").bind(uid,invite.id,now-30000).first();if(claimed)return failure('You are already joining another table.');
  if(target.room&&target.room!==invite.room){const left=await socialRPC(env,target.room,'friend-leave',uid);if(!left.ok)return failure('Finish your current deal before joining.');}
  await env.DB.prepare("UPDATE friend_invites SET status='scheduled',changed=? WHERE id=? AND status='pending'").bind(now,invite.id).run();
  const targetLease=await(await socialRPC(env,'__device:'+uid,'device-presence',uid)).json<{room?:string}>();const player=await socialPlayer(env,uid);const admitted=await socialRPC(env,invite.room,'friend-admit',invite.sender,{id:invite.id,target:uid,name:player?.name,avatar:player?.avatar,photo:player?.photoURL,previousRoom:targetLease.room||null});
  const result=await admitted.json<{status:'scheduled'|'joined';error?:string}>();if(!admitted.ok){await env.DB.prepare("UPDATE friend_invites SET status='failed',reason=?,changed=? WHERE id=? AND status='scheduled'").bind(result.error||'Seat unavailable',now,invite.id).run();await notifySocial(env,uid,invite.sender);return failure(result.error||'That team seat is no longer available.');}
  await env.DB.prepare("UPDATE friend_invites SET status=?,changed=? WHERE id=? AND status='scheduled'").bind(result.status,now,invite.id).run();
  const committed=await env.DB.prepare('SELECT status FROM friend_invites WHERE id=?').bind(invite.id).first<{status:'scheduled'|'joined'}>();result.status=committed?.status||result.status;
  if(result.status==='joined'){await setRoom(env,uid,invite.room);await setRoom(env,invite.sender,invite.room);}
  await notifySocial(env,uid,invite.sender);return Response.json({status:result.status,...(result.status==='joined'?{room:invite.room}:{})});
 }
 if(!['decline-invite','cancel-invite'].includes(input.action))return failure('Unknown friends action.',400);
 if(input.action==='decline-invite'&&invite.target!==uid||input.action==='cancel-invite'&&invite.sender!==uid)return failure('Invitation permission denied.',403);
 if(!['pending','scheduled'].includes(invite.status))return Response.json({status:invite.status});
 const status=input.action==='decline-invite'?'declined':'cancelled';const cancelled=await env.DB.prepare("UPDATE friend_invites SET status=?,changed=? WHERE id=? AND status IN ('pending','scheduled')").bind(status,now,invite.id).run();if(!cancelled.meta.changes)return Response.json({status:(await activeInvite(env,uid,invite.id))?.status||'expired'});await socialRPC(env,invite.room,'friend-cancel',invite.sender,{id:invite.id});await notifySocial(env,invite.sender,invite.target);return Response.json({status});
}
export async function completeFriendAdmission(env:SocialEnv,id:string,code:string,uid:string,sender:string,member:boolean,previousRoom?:string|null){await ensureSocialSchema(env.DB);await env.DB.prepare("UPDATE friend_invites SET status='joined',changed=? WHERE id=? AND status='scheduled'").bind(Date.now(),id).run();const current=await env.DB.prepare('SELECT status FROM friend_invites WHERE id=?').bind(id).first<{status:string}>();if(current?.status!=='joined')return;
 // Called while CardRoom holds its lock: never call that room (or another room) here.
 // Membership is supplied from its authoritative in-memory state; routing uses account CAS.
 if(member){const lease=await(await socialRPC(env,'__device:'+uid,'device-presence',uid)).json<{room?:string}>();if(lease.room!==code&&((previousRoom!==undefined&&(lease.room||null)===previousRoom)||!lease.room))await socialRPC(env,'__device:'+uid,'social-room',uid,{room:code,expectedRoom:lease.room||null});}
 await notifySocial(env,uid,sender);}

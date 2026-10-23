import {rosterById} from '../../packages/protocol/roster.ts';
import {REPORT_REASONS,REPORT_MAX_WORDS,REPORT_MAX_CHARS} from '../../packages/protocol/reports.ts';
import {friendRelation,socialRPC,type SocialEnv} from './social.ts';
const sql="CREATE TABLE IF NOT EXISTS player_reports(id TEXT PRIMARY KEY,reporter TEXT NOT NULL REFERENCES accounts(uid),target TEXT NOT NULL,target_kind TEXT NOT NULL,target_name TEXT NOT NULL,reason TEXT NOT NULL,details TEXT NOT NULL,room TEXT,match_id TEXT,created INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','reviewed','dismissed','action_taken')),review_notes TEXT NOT NULL DEFAULT '');";
/** Runs in the existing social coordinator: submissions and duplicate checks are serialized. */
export async function submitPlayerReport(env:SocialEnv,uid:string,input:any){
 const fail=(error:string,status=400)=>Response.json({error},{status});
 if(!input||typeof input.reason!=='string'||!Object.hasOwn(REPORT_REASONS,input.reason))return fail('Choose a report reason.');
 if(typeof input.details!=='string')return fail('Please explain what happened.');const details=input.details.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g,'').trim();
 if(details.length<10||details.length>REPORT_MAX_CHARS||details.split(/\s+/).length>REPORT_MAX_WORDS)return fail('Please use 10–750 characters and no more than 100 words.');
 if(typeof input.id!=='string'||!/^[a-f0-9-]{36}$/i.test(input.id))return fail('Invalid report reference.');
 let target:string,name:string,kind='account',room:string|null=null,match:string|null=null;
 if(input.room!==undefined){if(typeof input.room!=='string'||!(/^[A-F0-9]{8}$/).test(input.room)||!Number.isInteger(input.seat)||input.seat<0||input.seat>3)return fail('The player’s table is unavailable.');const response=await socialRPC(env,input.room,'report-target?seat='+input.seat,uid);if(!response.ok)return fail('Return to the player’s table before reporting.',409);const player=await response.json<{target:string;name:string;kind:string;matchId:string}>();if(input.target!==player.target)return fail('This seat has changed. Open the player profile again.',409);target=player.target;name=player.name;kind=player.kind;room=input.room;match=player.matchId;
 }else if(typeof input.target==='string'&&input.target.startsWith('roster:roster:')){const roster=rosterById(input.target.slice(7));if(!roster)return fail('This profile is unavailable.',404);target=input.target;name=roster.name;kind='roster';
 }else{if(typeof input.target!=='string'||input.target.length>128||input.target===uid)return fail('Choose another player.');if((await friendRelation(env.DB,uid,input.target)).status!=='friends')return fail('Report this player from their table profile.',403);const account=await env.DB.prepare('SELECT name FROM accounts WHERE uid=? AND deleted=0').bind(input.target).first<{name:string}>();if(!account)return fail('This profile is unavailable.',404);target=input.target;name=account.name;}
 if(target===uid)return fail('You cannot report your own profile.');
 await env.DB.batch([env.DB.prepare(sql),env.DB.prepare('CREATE INDEX IF NOT EXISTS player_reports_review ON player_reports(status,created)'),env.DB.prepare('CREATE INDEX IF NOT EXISTS player_reports_sender ON player_reports(reporter,created)')]);
 const now=Date.now();const existing=await env.DB.prepare('SELECT id FROM player_reports WHERE reporter=? AND (id=? OR (target=? AND created>?)) LIMIT 1').bind(uid,input.id,target,now-86400000).first<{id:string}>();if(existing)return Response.json({submitted:true,duplicate:true,id:existing.id});
 const count=await env.DB.prepare('SELECT COUNT(*) n FROM player_reports WHERE reporter=? AND created>?').bind(uid,now-86400000).first<{n:number}>();if((count?.n||0)>=5)return fail('You have reached the daily report limit. Please try again tomorrow.',429);
 await env.DB.prepare('INSERT INTO player_reports(id,reporter,target,target_kind,target_name,reason,details,room,match_id,created) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(input.id,uid,target,kind,name,input.reason,details,room,match,now).run();return Response.json({submitted:true,id:input.id});
}

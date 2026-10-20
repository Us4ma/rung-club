import {deviceHeaders} from './device-session.ts';
import {restoredIdentity} from './auth.ts';
import {ONLINE_ORIGIN,cloudHost} from './deployment.ts';
import type {LeagueSnapshot} from '../../packages/protocol/leagues.ts';
export const MATCHMAKING_NOTICE='Weekly league standings use verified, completed Open Rung results. Private rooms, invited tables, practice, gifts and purchases do not add league earnings.';
let cached:LeagueSnapshot|null=null,loadedAt=0,owner='';
const pending=new Map<string,Promise<LeagueSnapshot>>();
export async function leagueRequest(body?:object,tier?:number,group?:string){const user=await restoredIdentity();if(!user)throw Error('Sign in to view your league.');const base=import.meta.env.PROD&&!cloudHost?ONLINE_ORIGIN:'';const params=new URLSearchParams();if(tier!==undefined)params.set('tier',String(tier));if(group)params.set('group',group);const r=await fetch(base+'/api/leagues?'+params,{method:body?'POST':'GET',headers:{...deviceHeaders(),Authorization:'Bearer '+await user.getIdToken(),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();if(!r.ok)throw Error(data.error||'Leagues unavailable');return data;}
export async function loadStandings(tier?:number,group?:string,force=false):Promise<LeagueSnapshot>{const user=await restoredIdentity();if(!user)throw Error('Sign in to view your league.');if(owner!==user.uid){owner=user.uid;cached=null;loadedAt=0;pending.clear();}if(tier===undefined&&!group&&!force&&cached&&Date.now()-loadedAt<15000&&cached.ends>Date.now())return cached;const key=user.uid+':'+(tier??'own')+':'+(group??'');const previous=pending.get(key);if(previous)return previous;const request=leagueRequest(undefined,tier,group).then((data:LeagueSnapshot)=>{if(owner===user.uid&&tier===undefined&&!group){cached=data;loadedAt=Date.now();}return data;}).finally(()=>{if(pending.get(key)===request)pending.delete(key);});pending.set(key,request);return request;}
export function prefetchStandings(){return loadStandings().catch(()=>null);}
export function cachedStandings(){return cached;}
export async function acknowledgeSeason(season:number){await leagueRequest({action:'ack',season});if(cached?.finish&&cached.finish.season<=season)cached={...cached,finish:null};}

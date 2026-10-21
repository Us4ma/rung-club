import {deviceHeaders} from './device-session.ts';
import {restoredIdentity} from './auth.ts';
import {ONLINE_ORIGIN} from './deployment.ts';
import type {LeagueSnapshot} from '../../packages/protocol/leagues.ts';
export const MATCHMAKING_NOTICE='Weekly league standings count the winning team’s verified Open Rung net gold earnings, including split-pot wins, Kot and Goon Kot. The losing team’s returned pot share is not league earnings. Existing qualifying net-loss rules apply. Private rooms, invited tables, practice, gifts and purchases do not add league earnings.';
let cached:LeagueSnapshot|null=null,loadedAt=0,owner='';
const pending=new Map<string,Promise<LeagueSnapshot>>();
export async function leagueRequest(body?:object,tier?:number,group?:string){
 const user=await restoredIdentity();if(!user)throw Error('Sign in to view your league.');
 // Browser requests use the same-origin Vercel proxy, as Friends and table APIs do.
 const native=location.protocol==='capacitor:'||location.protocol==='https:'&&location.hostname==='localhost';
 const params=new URLSearchParams();if(tier!==undefined)params.set('tier',String(tier));if(group)params.set('group',group);
 let token=await user.getIdToken();
 for(let attempt=0;attempt<2;attempt++){
  const r=await fetch((native?ONLINE_ORIGIN:'')+'/api/leagues?'+params,{method:body?'POST':'GET',headers:{...deviceHeaders(),Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});
  if(r.status===401&&attempt===0){token=await user.getIdToken(true);continue;}
  const data=await r.json().catch(()=>{throw Error('The league server is temporarily unavailable. Please retry.');});
  if(!r.ok){if(data.code==='SESSION_ACTIVE')window.dispatchEvent(new Event('rung:session-replaced'));throw Error(data.error||'Leagues unavailable');}return data;
 }throw Error('Reconnect to load your league.');
}
export async function loadStandings(tier?:number,group?:string,force=false):Promise<LeagueSnapshot>{const user=await restoredIdentity();if(!user)throw Error('Sign in to view your league.');if(owner!==user.uid){owner=user.uid;cached=null;loadedAt=0;pending.clear();}if(tier===undefined&&!group&&!force&&cached&&Date.now()-loadedAt<15000&&cached.ends>Date.now())return cached;const key=user.uid+':'+(tier??'own')+':'+(group??'');const previous=pending.get(key);if(previous)return previous;const request=leagueRequest(undefined,tier,group).then((data:LeagueSnapshot)=>{if(owner===user.uid&&tier===undefined&&!group){cached=data;loadedAt=Date.now();}return data;}).finally(()=>{if(pending.get(key)===request)pending.delete(key);});pending.set(key,request);return request;}
export function prefetchStandings(force=false){return loadStandings(undefined,undefined,force).catch(()=>null);}
export function cachedStandings(){return cached;}
export async function acknowledgeSeason(season:number){await leagueRequest({action:'ack',season});if(cached?.finish&&cached.finish.season<=season)cached={...cached,finish:null};}

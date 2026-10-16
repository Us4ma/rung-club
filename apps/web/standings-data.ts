import {deviceHeaders} from './device-session.ts';
import {restoredIdentity} from './auth.ts';
import {ONLINE_ORIGIN,cloudHost} from './deployment.ts';
export const MATCHMAKING_NOTICE='Matches may include computer-controlled opponents when human players are unavailable. These opponents have persistent profiles and earn records from completed games, including roster exhibition games. Global standings include both human and computer-controlled participants.';
export type Row={name:string;avatar:number;photoURL?:string;rank:number|null;played:number;wins:number;losses:number;winRate:number;sars:number};
let cached:Row[]|null=null,pending:Promise<Row[]>|null=null,loadedAt=0,owner='';
export function prefetchStandings(){return loadStandings().catch(()=>null);}
export async function loadStandings(){const user=await restoredIdentity();if(!user)throw Error('Sign in to view global standings.');if(owner!==user.uid){owner=user.uid;cached=null;loadedAt=0;pending=null;}if(cached&&Date.now()-loadedAt<20000)return cached;if(pending)return pending;const requestOwner=owner;pending=(async()=>{const base=import.meta.env.PROD&&!cloudHost?ONLINE_ORIGIN:'';const response=await fetch(base+'/api/identity?leaderboard=1',{headers:{...deviceHeaders(),Authorization:'Bearer '+await user.getIdToken()}});const data=await response.json();if(!response.ok)throw Error(data.error||'Standings unavailable');if(owner===requestOwner){cached=data.rows;loadedAt=Date.now();}return data.rows as Row[];})().finally(()=>{if(owner===requestOwner)pending=null;});return pending;}

export function cachedStandings(){return cached;}

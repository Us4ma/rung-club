import {partnerOf} from '../core/seats.ts';
import {DEFAULT,type State} from '../core/index.ts';
import {Session} from './index.ts';
import {clockFor,expireTurn,type Clock} from './timing.ts';
export const RESULT_PAUSE_MS=2400,RECONNECT_GRACE_MS=60000;
export type Membership={departed:boolean[];disconnectedAt:(number|null)[];pendingPartners:number[];closed:string|null;transitionAt?:number;settledDeal?:string};
export function membership():Membership{return {departed:[false,false,false,false],disconnectedAt:[null,null,null,null],pendingPartners:[],closed:null};}
export function leaveSeat(m:Membership,uids:(string|null)[],s:State,seat:number){
 if(!uids[seat]||m.closed)return;
 uids[seat]=null;m.departed[seat]=true;m.disconnectedAt[seat]=null;s.interrupted=true;
 const partner=partnerOf(seat);if(uids[partner]&&!m.pendingPartners.includes(partner))m.pendingPartners.push(partner);
 m.pendingPartners=m.pendingPartners.filter(i=>!!uids[i]);
 if(uids.every(u=>!u))m.closed='No human players remain.';
 else if([0,1].some(t=>m.departed[t]&&m.departed[partnerOf(t)]))m.closed='Both human players on a team have left.';
}
export function disconnected(m:Membership,seat:number,now:number){if(!m.closed&&!m.departed[seat]&&m.disconnectedAt[seat]===null)m.disconnectedAt[seat]=now;}
export function reconnected(m:Membership,seat:number){if(m.departed[seat]||m.closed)throw Error('This seat has left the table');m.disconnectedAt[seat]=null;}
export function expireDisconnected(m:Membership,uids:(string|null)[],s:State,now:number){m.disconnectedAt.forEach((at,i)=>{if(at!==null&&now-at>=RECONNECT_GRACE_MS)leaveSeat(m,uids,s,i);});}
export function continueWithBot(m:Membership,s:State,seat:number){if(s.phase!=='finished'||!m.pendingPartners.includes(seat)||m.closed)throw Error('No teammate decision is pending');m.pendingPartners=m.pendingPartners.filter(i=>i!==seat);}
export function expireRoomTurn(session:Session,clock:Clock|undefined,m:Membership,now:number){
 if(m.closed||!clock||now<clock.deadline)return false;
 const current=clockFor(session.state,true,undefined,now);if(current?.key!==clock.key)return false;
 if(m.disconnectedAt[session.state.turn]!==null)session.state.interrupted=true;
 return expireTurn(session,clock,now);
}
export function prepareTransition(m:Membership,s:State,now:number){if(s.phase==='finished'&&!m.closed)m.transitionAt??=now+RESULT_PAUSE_MS;}
export function advanceTable(session:Session,m:Membership,now:number){
 if(m.closed||m.pendingPartners.length||session.state.phase!=='finished'||!m.transitionAt||now<m.transitionAt)return false;
 const id=session.state.matchId;if(!session.advance(id))return false;session.state.interrupted=m.departed.some(Boolean);m.transitionAt=undefined;m.settledDeal=undefined;return true;
}
export function roomDeadline(m:Membership,clock:Clock|undefined,updated:number){const times=[clock?.deadline,...m.disconnectedAt.filter((n):n is number=>n!==null).map(n=>n+RECONNECT_GRACE_MS),...(!m.pendingPartners.length&&m.transitionAt?[m.transitionAt]:[]),updated+86400000].filter((n):n is number=>n!==undefined);return Math.min(...times);}
/** Restore older saved tables without rerunning the opening contest or changing seats. */
export function restoreRules(s:State){s.policy={...s.policy,version:DEFAULT.version,collectionLead:'eligible-senior'};if(s.mode==='open'&&s.trick[0]){const lead=s.trick[0];lead.bhaag=s.senior===lead.seat&&lead.card.rank!==14&&lead.card.suit!==s.trump;}return s;}

import {view,type State} from '../core/index.ts';
import {choose,chooseTrump} from '../ai/index.ts';
import {Session,type Command} from './index.ts';
export const DEFAULT_TIMERS={calling:20000,playing:20000,bot:700};
export type Clock={key:string;deadline:number;duration:number};
export function clockFor(s:State,started:boolean,previous:Clock|undefined,now=Date.now(),bot=false,timers=DEFAULT_TIMERS):Clock|undefined{
 if(!started||s.phase==='finished')return undefined;
 // Reveal changes revision but does not buy a fresh turn. Redeals do start a new calling phase.
 const key=[s.matchId,s.phase,s.turn,s.history.length,s.trick.length,s.redeals].join(':');
 if(previous?.key===key)return previous;
 const duration=bot?timers.bot:timers[s.phase];return {key,deadline:now+duration,duration};
}
export function automaticCommand(session:Session):Command{
 const s=session.state,seat=s.turn,v=view(s,seat);let card:string|undefined,type:Command['type'];
 if(v.phase==='calling'){type='call';card=chooseTrump(v);}
 else if(v.canReveal){type='reveal';}
 else {type='play';try{card=choose(v,seat,'advanced');}catch{card=v.legal[0];}if(!card||!v.legal.includes(card))card=v.legal[0];if(!card)throw Error('No legal automatic move');}
 return {matchId:s.matchId,id:'auto:'+s.revision,seq:session.seq[seat]+1,revision:s.revision,type,card};
}
export function expireTurn(session:Session,clock:Clock|undefined,now=Date.now()):boolean{
 if(!clock||now<clock.deadline||session.state.phase==='finished')return false;
 if(clockFor(session.state,true,undefined,now)?.key!==clock.key)return false;
 session.apply(session.state.turn,automaticCommand(session));return true;
}

import {openingDrawMs,DEAL_PRESENTATION_MS,CALLER_RESULT_MS,REDEAL_PRESENTATION_MS} from './presentation.ts';
import {view,type State} from '../core/index.ts';
import {choose,chooseTrump} from '../ai/index.ts';
import {Session,type Command} from './index.ts';
export const DEFAULT_TIMERS={calling:10000,playing:10000,bot:3000};
export type Clock={key:string;deadline:number;duration:number;readyAt?:number;actionAt?:number;automatic?:boolean};
export const decisionAt=(clock:Clock)=>clock.actionAt??clock.deadline;
/** Timing randomness is cosmetic. The resulting decision time is stored once per turn. */
export function thinkingDelay(){return 2000+Math.floor(Math.random()*2001);}
export function clockFor(s:State,started:boolean,previous:Clock|undefined,now=Date.now(),automatic=false,timers=DEFAULT_TIMERS,presentationDone=false):Clock|undefined{
 if(!started||s.phase==='finished')return undefined;
 const key=[s.matchId,s.phase,s.turn,s.history.length,s.trick.length,s.redeals].join(':');
 if(previous?.key===key){
  if(!!previous.automatic===automatic)return previous;
  return {...previous,automatic,actionAt:automatic?Math.min(previous.deadline,Math.max(now,previous.readyAt??now)+thinkingDelay()):undefined};
 }
 const presentation=presentationDone?(s.phase==='playing'&&s.history.length>0&&!s.trick.length?1200:0):s.phase==='calling'?(s.invalidDeal?REDEAL_PRESENTATION_MS:DEAL_PRESENTATION_MS+(s.opening&&s.redeals===0?openingDrawMs(s.opening.rounds.length):0)):s.history.length===0&&!s.trick.length?CALLER_RESULT_MS+DEAL_PRESENTATION_MS:!s.trick.length?1200:0;
 const duration=timers[s.phase],readyAt=now+presentation,deadline=readyAt+duration;
 const think=s.phase==='calling'?Math.max(3000,thinkingDelay()):thinkingDelay();
 return {key,deadline,duration,readyAt,automatic,actionAt:automatic?Math.min(deadline,readyAt+think):undefined};
}
export function automaticCommand(session:Session):Command{
 const s=session.state,seat=s.turn,v=view(s,seat);let card:string|undefined,type:Command['type'];
 if(v.phase==='calling'){type='call';card=chooseTrump(v);}
 else if(v.canReveal){type='reveal';}
 else {type='play';try{card=choose(v,seat,'advanced');}catch{card=v.legal[0];}if(!card||!v.legal.includes(card))card=v.legal[0];if(!card)throw Error('No legal automatic move');}
 return {matchId:s.matchId,id:'auto:'+s.revision,seq:session.seq[seat]+1,revision:s.revision,type,card};
}
export function expireTurn(session:Session,clock:Clock|undefined,now=Date.now()):boolean{
 if(!clock||now<decisionAt(clock)||session.state.phase==='finished')return false;
 if(clockFor(session.state,true,undefined,now)?.key!==clock.key)return false;
 session.apply(session.state.turn,automaticCommand(session));return true;
}

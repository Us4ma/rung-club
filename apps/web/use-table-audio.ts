import {useEffect,useRef} from 'react';
import {winning,type View} from '../../packages/core/index.ts';
import {tableAudio} from './table-audio.ts';
/** Observe confirmed state, never clicks. Hydrated/reconnected views are silent baselines. */
export function useTableAudio(v:View|null,active:boolean,enabled:boolean,seat:number,epoch:number){
 const previous=useRef(v),scope=useRef(''),timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 useEffect(()=>{tableAudio.configure(active,enabled);return()=>{timers.current.forEach(clearTimeout);timers.current=[];tableAudio.clear();};},[active,enabled]);
 useEffect(()=>{const cancel=()=>{timers.current.forEach(clearTimeout);timers.current=[];},unlock=()=>tableAudio.unlock(),visibility=()=>{if(document.hidden)cancel();tableAudio.setForeground(!document.hidden);},hide=()=>{cancel();tableAudio.setForeground(false);};
  const native=(event:Event)=>{const foreground=(event as CustomEvent).detail?.active===true&&!document.hidden;if(!foreground)cancel();tableAudio.setForeground(foreground);};
  visibility();document.addEventListener('pointerdown',unlock);document.addEventListener('keydown',unlock);document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',hide);window.addEventListener('pageshow',visibility);window.addEventListener('rung-app-state',native);
  return()=>{document.removeEventListener('pointerdown',unlock);document.removeEventListener('keydown',unlock);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',hide);window.removeEventListener('pageshow',visibility);window.removeEventListener('rung-app-state',native);timers.current.forEach(clearTimeout);tableAudio.clear();};
 },[]);
 useEffect(()=>{const old=previous.current;previous.current=v;const key=active&&v?`${epoch}:${v.matchId}:${v.redeals}`:'';
  if(scope.current!==key){scope.current=key;timers.current.forEach(clearTimeout);timers.current=[];tableAudio.clear();return;}
  if(!active||!enabled||!old||!v||v.revision<=old.revision)return;
  // Missed transitions are snapshots, not a backlog of sounds to replay.
  if(v.history.length-old.history.length>1){timers.current.forEach(clearTimeout);timers.current=[];tableAudio.clear();return;}
  const later=(fn:()=>void,ms:number)=>{const id=setTimeout(()=>{timers.current=timers.current.filter(t=>t!==id);fn();},ms);timers.current.push(id);};
  const completed=v.history.length===old.history.length+1;
  // Compare card identities: revisions can jump when WebSocket updates are batched.
  // A completed fourth card has already moved from trick into history.
  const seen=new Set([...old.trick,...old.history.flat()].map(p=>p.card.id));
  const groups=completed?[v.history.at(-1)!,v.trick]:[v.trick];
  for(const plays of groups)for(let i=0;i<plays.length;i++){
   const card=plays[i];if(seen.has(card.card.id))continue;seen.add(card.card.id);
   const bestBefore=winning(plays.slice(0,i)),bestAfter=winning(plays.slice(0,i+1));
   const cut=card.trump&&bestAfter===card&&!!bestBefore&&bestBefore.seat%2!==card.seat%2;
   tableAudio.effect(cut?'cut':'place',700);
  }
  if(!old.revealed&&v.revealed&&v.trump)tableAudio.effect('reveal',600);
  if(completed){later(()=>tableAudio.effect('gather',200),800);
   const collection=v.collections?.at(-1),collected=collection&&collection.sar===v.history.length;
   if(collected){later(()=>tableAudio.effect('collect',350),1120);}
   if(v.phase==='finished'){const won=v.scores[seat%2]>v.scores[(seat+1)%2],special=v.result==='Kot'||v.result==='Goon Kot';
    later(()=>{tableAudio.effect(special?'kot':won?'win':'lose',1000);},1750);
   }else if(v.history.length===4&&v.policy.opening===5)later(()=>tableAudio.effect('turn',300),1120);
  }
 },[v?.matchId,v?.revision,active,enabled,epoch,seat]);
}

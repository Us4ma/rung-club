import React,{useEffect,useRef,useState} from 'react';
import type {View} from '../../packages/core/index.ts';
import {SUITS} from '../../packages/ui/config.ts';
export const suitNames={S:'Spades',H:'Hearts',D:'Diamonds',C:'Clubs'};
/** One pointer gesture and one outstanding command; no second independent double-click handler. */
export function useCardInput(v:View|null,seat:number,quick:boolean,submit:(id:string)=>void,select:(id:string)=>void,interval=320){
 const last=useRef({id:'',time:0,revision:-1}),pointer=useRef({x:0,y:0,moved:false});
 useEffect(()=>{last.current={id:'',time:0,revision:-1};},[v?.matchId,v?.revision]);
 return {down:(e:React.PointerEvent)=>{pointer.current={x:e.clientX,y:e.clientY,moved:false};},move:(e:React.PointerEvent)=>{if(Math.hypot(e.clientX-pointer.current.x,e.clientY-pointer.current.y)>10)pointer.current.moved=true;},cancel:()=>{pointer.current.moved=true;last.current.id='';},tap:(id:string)=>{
  if(pointer.current.moved||!v||v.turn!==seat||!v.legal.includes(id)){last.current.id='';return;}
  const now=performance.now(),old=last.current;select(id);
  if(quick&&old.id===id&&old.revision===v.revision&&now-old.time<=interval){last.current.id='';submit(id);}
  else last.current={id,time:now,revision:v.revision};
 }};
}
export function TableHUD({v,seat}:{v:View;seat:number}){return <div className="scorebar compact-hud" aria-label="Table scoreboard"><div data-team={seat%2}><small>YOUR TEAM</small><strong>{v.scores[seat%2]} <span>Sars</span></strong></div><div className={v.revealed?'rung-known':''}><small>{v.revealed?'RUNG':'HIDDEN RUNG'}</small><strong>{v.phase==='calling'?'—':v.revealed?SUITS[v.trump!]: 'Sealed'}</strong></div><div data-team={(seat+1)%2}><small>OPPONENTS</small><strong>{v.scores[(seat+1)%2]} <span>Sars</span></strong></div><div><small>SAR</small><strong>{Math.min(13,v.history.length+1)} <span>/ 13</span></strong></div><div><small>PILE</small><strong>{v.pile}</strong></div></div>;}
export function RungBanner({v,seat,seconds,timed,disabled,onCall}:{v:View;seat:number;seconds:number;timed:boolean;disabled:(s:string)=>boolean;onCall:(s:string)=>void}){if(v.phase!=='calling')return null;return <section className="rung-banner" aria-label="Rung selection"><h3>{v.turn===seat?'CHOOSE YOUR RUNG':'Waiting for trump caller…'}</h3>{timed&&<span role="timer">{seconds}s remaining</span>}<p>{v.mode==='band'?'Select one of your five cards below to seal hidden Rung.':'Examine your five cards, then choose a suit.'}</p>{v.turn===seat&&v.mode==='open'&&<div className="suit-choices">{Object.entries(SUITS).map(([s,g])=><button key={s} aria-label={g} disabled={disabled(s)} onClick={()=>onCall(s)}><b>{g}</b><small>{suitNames[s as keyof typeof suitNames]}</small></button>)}</div>}{v.redeals>0&&<small>Reshuffled · no points awarded</small>}</section>;}
export type Announcement={id:string;text:string;priority:number;voiceKey:string};
export function tableEvents(previous:View,current:View,seat:number,names:string[]):Announcement[]{
 if(previous.matchId!==current.matchId)return [];
 const events:Announcement[]=[],add=(key:string,text:string,priority:number)=>events.push({id:current.matchId+':'+key,text,priority,voiceKey:key.split(':')[0]});
 if(!previous.revealed&&current.revealed||previous.phase==='calling'&&current.phase==='playing'){
  if(current.revealed&&current.trump)add('rung:'+current.redeals,suitNames[current.trump]+' '+SUITS[current.trump]+' is the Rung!',4);
  else add('sealed:'+current.redeals,'Hidden Rung is sealed.',3);
 }
 if(current.history.length>previous.history.length){const n=current.history.length,w=current.winners.at(-1)!;
  if(current.phase==='finished')add('result',current.result||'Deal complete',6);
  else if(current.scores.some((score,i)=>score>previous.scores[i]))add('collection:'+n,w===seat?'You collected the Sars!':names[w]+' collects the Sars!',5);
  else add('senior:'+n,w===seat?"You're Senior!":names[w]+' is Senior!',2);
  if(n===4&&current.policy.opening===5)add('fifth','Fifth Sar — first collection chance!',5);
 }
 if(current.phase==='playing'&&current.turn===seat&&(previous.turn!==seat||previous.phase!=='playing'))add('turn:'+current.revision,'YOUR TURN',1);
 return events;
}
export function DealerAnnouncements({v,seat,names}:{v:View;seat:number;names:string[]}){
 const previous=useRef(v),seen=useRef(new Set<string>()),[queue,setQueue]=useState<Announcement[]>([]);
 useEffect(()=>{if(previous.current.matchId!==v.matchId){previous.current=v;seen.current.clear();setQueue([]);return;}const events=tableEvents(previous.current,v,seat,names).filter(e=>!seen.current.has(e.id));previous.current=v;events.forEach(e=>seen.current.add(e.id));setQueue(q=>[...q.filter(e=>e.voiceKey!=='turn'||v.turn===seat&&v.phase==='playing'),...events].sort((a,b)=>b.priority-a.priority));},[v.matchId,v.revision]);
 useEffect(()=>{if(!queue.length)return;const t=setTimeout(()=>setQueue(q=>q.slice(1)),queue[0].priority===1?900:1800);return()=>clearTimeout(t);},[queue[0]?.id]);
 const e=queue[0];return e?<div key={e.id} className={'dealer-speech'+(e.voiceKey==='fifth'?' fifth-sar':e.voiceKey==='turn'?' turn-announcement':'')} role="status" data-voice-key={e.voiceKey}><strong>{e.text}</strong>{e.voiceKey==='fifth'&&<small>Win Sars 4 and 5 with the same player to collect.</small>}</div>:null;
}
export function TablePreferences({settings,onChange}:{settings:any;onChange:(value:any)=>void}){const [open,setOpen]=useState(false);return <><button className="icon-button" aria-label="Table settings" aria-expanded={open} onClick={()=>setOpen(!open)}>⚙</button>{open&&<section className="table-preferences" role="dialog" aria-label="Table preferences" onKeyDown={e=>{if(e.key==='Escape')setOpen(false);}}><strong>Table preferences</strong><button aria-label="Close table settings" onClick={()=>setOpen(false)}>×</button>{[['quickPlay','Double-tap quick play'],['motion','Animations'],['sound','Sound effects']].map(([key,label])=><label key={key}>{label}<input type="checkbox" checked={key==='quickPlay'?settings[key]!==false:!!settings[key]} onChange={e=>onChange({...settings,[key]:e.target.checked})}/></label>)}</section>}</>;}
export function TrickCards({v,seat,names,motion}:{v:View;seat:number;names:string[];motion:boolean}){
 const [settled,setSettled]=useState(false),root=useRef<HTMLDivElement>(null),seenPlays=useRef(new Set<string>());
 const completed=v.trick.length===0&&v.history.length>0,plays=v.trick.length?v.trick:v.history.at(-1)||[];
 useEffect(()=>{setSettled(false);if(!completed)return;const t=setTimeout(()=>setSettled(true),motion?650:80);return()=>clearTimeout(t);},[v.revision,completed,motion]);
 useEffect(()=>{if(!motion||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;const elements=root.current?.querySelectorAll<HTMLElement>('[data-play]');elements?.forEach(el=>{const p=plays.find(p=>p.card.id===el.dataset.play)!;const target=el.getBoundingClientRect();const origin=root.current?.closest<HTMLElement>('.table-scene')?.dataset;const source=p.seat===seat&&origin?.originCard===p.card.id?{x:Number(origin.originX),y:Number(origin.originY)}:document.querySelector<HTMLElement>(`[data-seat="${p.seat}"]`)?.getBoundingClientRect();const image=el.querySelector('img');if(!image?.animate)return;
  if(completed){const destination=document.querySelector(v.pile===0?`.compact-hud [data-team="${v.winners.at(-1)!%2}"]`:'.pile')?.getBoundingClientRect();if(destination)image.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${destination.x-target.x}px,${destination.y-target.y}px) scale(.2)`,opacity:0}],{duration:450,delay:180,fill:'forwards'});}
  else if(source&&!seenPlays.current.has(v.matchId+':'+p.card.id))image.animate([{transform:`translate(${source.x-target.x}px,${source.y-target.y}px) scale(.65)`,opacity:.4},{transform:'translate(0,0)',opacity:1}],{duration:220});
 });plays.forEach(p=>seenPlays.current.add(v.matchId+':'+p.card.id));},[v.revision,motion]);
 if(completed&&settled)return null;
 return <div ref={root} className="trick-layer">{plays.map(p=><div key={p.card.id} data-play={p.card.id} className={'played play-'+((p.seat-seat+4)%4)+(completed&&p.seat===v.winners.at(-1)?' winning-card':'')} aria-label={names[p.seat]+': '+p.card.id+(p.effective!==p.card.rank?' counts as 2':'')}><span className="card-face small"><img src={'/art/house/cards/'+(p.card.rank===14?'A':p.card.rank===13?'K':p.card.rank===12?'Q':p.card.rank===11?'J':p.card.rank)+p.card.suit+'.svg'} alt=""/></span>{p.effective!==p.card.rank&&<small>Counts as 2</small>}</div>)}</div>;
}
export function HandMotion({v,sorted,motion}:{v:View;sorted:boolean;motion:boolean}){
 const positions=useRef(new Map<string,DOMRect>()),oldSort=useRef(sorted);
 React.useLayoutEffect(()=>{const next=new Map<string,DOMRect>();document.querySelectorAll<HTMLElement>('.hand [data-card]').forEach(el=>{const id=el.dataset.card!,rect=el.getBoundingClientRect(),old=positions.current.get(id);if(motion&&old&&oldSort.current!==sorted&&el.animate&&!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)el.animate([{translate:`${old.x-rect.x}px ${old.y-rect.y}px`},{translate:'0px 0px'}],{duration:180});next.set(id,rect);});positions.current=next;oldSort.current=sorted;},[v.revision,sorted,motion]);return null;
}

export function rememberCardOrigin(scene:HTMLDivElement|null,id:string){const card=scene?.parentElement?.querySelector<HTMLElement>(`.hand [data-card="${id}"]`);if(!scene||!card)return;const r=card.getBoundingClientRect();scene.dataset.originCard=id;scene.dataset.originX=String(r.x);scene.dataset.originY=String(r.y);}

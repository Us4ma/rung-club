import React,{useEffect,useRef,useState} from 'react';
import {rightOf} from '../../packages/core/seats.ts';
import type {View} from '../../packages/core/index.ts';
import {SUITS,rank} from '../../packages/ui/config.ts';
import {art,Icon} from './art.tsx';
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
export function TableHUD({v,seat}:{v:View;seat:number}){return <div className="scorebar compact-hud" aria-label="Table scoreboard"><div data-team={seat%2}><small>YOUR TEAM</small><strong>{v.scores[seat%2]} <span>Sars</span></strong><small><span className="full-score-text">{v.table?.points[seat%2]??0} match points · {v.table?.dealsWon[seat%2]??0} deals</span><span className="compact-score-text" aria-hidden="true">{v.table?.points[seat%2]??0} pts · {v.table?.dealsWon[seat%2]??0} deals</span></small></div><div className={v.revealed?'rung-known':''}><small>{v.revealed?'RUNG':'HIDDEN RUNG'}</small><strong>{v.phase==='calling'?'—':v.revealed?SUITS[v.trump!]: 'Sealed'}</strong></div><div data-team={(seat+1)%2}><small>OPPONENTS</small><strong>{v.scores[(seat+1)%2]} <span>Sars</span></strong><small><span className="full-score-text">{v.table?.points[(seat+1)%2]??0} match points · {v.table?.dealsWon[(seat+1)%2]??0} deals</span><span className="compact-score-text" aria-hidden="true">{v.table?.points[(seat+1)%2]??0} pts · {v.table?.dealsWon[(seat+1)%2]??0} deals</span></small></div><div><small>SAR</small><strong>{Math.min(13,v.history.length+1)} <span>/ 13</span></strong></div><div><small>PILE</small><strong>{v.pile}</strong></div></div>;}
export function RungBanner({v,seat,seconds,timed,disabled,onCall,stakes}:{v:View;seat:number;seconds:number;timed:boolean;disabled:(s:string)=>boolean;onCall:(s:string,stake?:number)=>void;stakes?:{min:number;max:number;step:number}|null}){
 const [suit,setSuit]=useState(''),[stake,setStake]=useState(stakes?.min||0);
 useEffect(()=>{setSuit('');setStake(stakes?.min||0);},[v.matchId,v.redeals,stakes?.min]);
 const value=stakes?Math.max(stakes.min,Math.min(stakes.max,stake||stakes.min)):0;
 if(v.phase!=='calling')return null;const caller=v.turn===seat,choosing=caller&&!!stakes&&v.mode==='open';
 return <section className={'rung-banner'+(choosing?' choosing-stake':'')} aria-label="Rung selection"><h3>{caller?(choosing?'CHOOSE RUNG & STAKE':'CHOOSE YOUR RUNG'):'Waiting for trump caller…'}</h3>{timed&&<span role="timer">{seconds}s remaining</span>}{choosing&&<div className="caller-hand-preview" role="group" aria-label="Your five cards">{v.hand.slice(0,5).map(c=><img key={c.id} src={art('house/cards/'+rank(c.rank)+c.suit+'.webp')} alt={rank(c.rank)+' of '+suitNames[c.suit]}/>)}</div>}<p>{v.mode==='band'?'Select one of your five cards below to seal hidden Rung.':'Examine your five cards, then choose a suit.'}</p>{caller&&v.mode==='open'&&<div className="suit-choices">{Object.entries(SUITS).map(([s,g])=><button key={s} aria-label={g} aria-pressed={choosing?suit===s:undefined} disabled={disabled(s)} onClick={()=>choosing?setSuit(s):onCall(s)}><b>{g}</b><small>{suitNames[s as keyof typeof suitNames]}</small></button>)}</div>}{choosing&&<div className="caller-stakes"><label htmlFor="caller-stake">Stake per player <output>{value}</output></label><div className="caller-stake-range"><button aria-label="Minimum stake" disabled={disabled(suit)||value===stakes.min} onClick={()=>setStake(stakes.min)}>Min</button><input id="caller-stake" aria-label="Stake per player" type="range" min={stakes.min} max={stakes.max} step={stakes.step} value={value} disabled={disabled(suit)||stakes.max===stakes.min} onChange={e=>setStake(Number(e.target.value))}/><button aria-label="Maximum stake" disabled={disabled(suit)||value===stakes.max} onClick={()=>setStake(stakes.max)}>Max</button></div><small>{stakes.min} – {stakes.max} · Pot {value*4}</small><button className="confirm-rung-stake" disabled={!suit||disabled(suit)} onClick={()=>onCall(suit,value)}>Confirm Rung · {value} coins</button></div>}{v.redeals>0&&<small>{caller?'Same caller: choose Rung again.':'The same caller chooses Rung again.'} No points awarded.</small>}</section>;
}

export type Announcement={id:string;text:string;priority:number;voiceKey:string};
export function tableEvents(previous:View,current:View,seat:number,names:string[]):Announcement[]{
 if(previous.matchId!==current.matchId)return [];
 const events:Announcement[]=[],add=(key:string,text:string,priority:number)=>events.push({id:current.matchId+':'+key,text,priority,voiceKey:key.split(':')[0]});
 if(!previous.revealed&&current.revealed||previous.phase==='calling'&&current.phase==='playing'){
  if(current.revealed&&current.trump)add('rung:'+current.redeals,suitNames[current.trump]+' '+SUITS[current.trump]+' is the Rung!',4);
  else add('sealed:'+current.redeals,'Hidden Rung is sealed.',3);
 }
 if(current.history.length>=4&&current.trick.length===1&&previous.trick.length===0&&current.trick[0].bhaag&&current.streak>=1&&current.streakSeat===current.trick[0].seat)add('bhaag:'+current.revision,'Another win can collect this pile.',2);
 if(current.history.length>previous.history.length){const n=current.history.length,w=current.winners.at(-1)!;
  if(current.phase==='finished')add('result','Team '+((current.scores[0]>current.scores[1]?0:1)+1)+' won the deal.',6);
  else if(current.scores.some((score,i)=>score>previous.scores[i]))add('collection:'+n,w===seat?'You collected the Sars!':names[w]+' collects the Sars!',5);
  else add('senior:'+n,w===seat?"You're Senior!":names[w]+' is Senior!',2);
  if(n===4&&current.policy.opening===5)add('fifth','Fifth Sar. Play for the pile.',5);
 }
 
 return events;
}
export function DealerAnnouncements({v,seat,names,notice,settlement,serverNow,busy=false}:{v:View;seat:number;names:string[];notice?:{id:string;text:string}|null;settlement?:{id:string;extra?:number;at:number}|null;serverNow?:number;busy?:boolean}){
 const lastNotice=useRef('');
 const previous=useRef(v),seen=useRef(new Set<string>()),[queue,setQueue]=useState<Announcement[]>([]);
 useEffect(()=>{if(previous.current.matchId!==v.matchId){previous.current=v;seen.current.clear();setQueue([]);return;}const events=tableEvents(previous.current,v,seat,names).filter(e=>!seen.current.has(e.id));previous.current=v;events.forEach(e=>seen.current.add(e.id));setQueue(q=>[...q.filter(e=>!(e.voiceKey==='senior'&&events.some(n=>n.voiceKey==='senior'))),...events].sort((a,b)=>b.priority-a.priority));},[v.matchId,v.revision]);
 useEffect(()=>{if(!queue.length)return;const t=setTimeout(()=>setQueue(q=>q.slice(1)),queue[0].voiceKey==='goon-kot'?5500:queue[0].priority>=4?3200:2600);return()=>clearTimeout(t);},[queue[0]?.id]);
 useEffect(()=>{if(!notice||busy||lastNotice.current===notice.id)return;lastNotice.current=notice.id;setQueue(q=>[...q,{id:notice.id,text:notice.text,priority:4,voiceKey:'roster'}]);},[notice?.id,busy]);
 useEffect(()=>{
  if(busy||v.phase!=='finished'||!settlement||settlement.id!==v.matchId||!settlement.extra)return;
  const id=settlement.id+':goon-charge';if(seen.current.has(id))return;
  const age=Math.max(0,(serverNow??Date.now())-settlement.at);if(age>6200)return;
  const extra=settlement.extra;
  const timer=setTimeout(()=>{
   seen.current.add(id);
   const event={id,text:'Goon Kot! Collecting '+extra.toLocaleString('en-US')+' extra coins from each calling-team player ('+(extra*2).toLocaleString('en-US')+' extra total). Each contributes '+(extra+extra/3).toLocaleString('en-US')+' coins in total.',priority:8,voiceKey:'goon-kot'};
   setQueue(q=>[event,...q.filter(e=>e.voiceKey!=='result'&&e.id!==id)]);
  },Math.max(0,800-age));
  return()=>clearTimeout(timer);
 },[settlement?.id,v.matchId,v.phase,busy]);
 const e=queue[0];return e?<div key={e.id} className={'dealer-speech'+(e.voiceKey==='fifth'?' fifth-sar':e.voiceKey==='turn'?' turn-announcement':'')} role="status" data-voice-key={e.voiceKey}><strong>{e.text}</strong></div>:null;
}
export function TablePreferences({settings,onChange}:{settings:any;onChange:(value:any)=>void}){const [open,setOpen]=useState(false);useEffect(()=>{if(!open)return;const close=(e:PointerEvent)=>{if(!(e.target as Element).closest('.table-tools'))setOpen(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[open]);return <><button className="icon-button" aria-label="Table settings" aria-expanded={open} onClick={()=>setOpen(!open)}><Icon name="settings"/></button>{open&&<section className="table-preferences" role="dialog" aria-label="Table preferences" onKeyDown={e=>{if(e.key==='Escape')setOpen(false);}}><strong>Table preferences</strong><button aria-label="Close table settings" onClick={()=>setOpen(false)}>×</button>{[['quickPlay','Double-tap quick play'],['motion','Animations'],['sound','Sound effects']].map(([key,label])=><label key={key}>{label}<input type="checkbox" checked={key==='quickPlay'?settings[key]!==false:!!settings[key]} onChange={e=>onChange({...settings,[key]:e.target.checked})}/></label>)}</section>}</>;}
/** Hydrated cards are a baseline. Only new authoritative transitions create motion. */
export function TrickCards({v,seat,names,motion}:{v:View;seat:number;names:string[];motion:boolean}){
 const root=useRef<HTMLDivElement>(null),previous=useRef(v),seen=useRef(new Set(v.trick.map(p=>v.matchId+':'+p.card.id))),gathered=useRef('');
 const [recent,setRecent]=useState(0);
 const completed=!v.trick.length&&recent===v.history.length&&recent>0;
 const plays=v.trick.length?v.trick:completed?v.history.at(-1)||[]:[];
 React.useLayoutEffect(()=>{const old=previous.current;previous.current=v;
  if(old.matchId!==v.matchId||v.history.length-old.history.length>1){seen.current=new Set(v.trick.map(p=>v.matchId+':'+p.card.id));setRecent(0);return;}
  if(v.history.length===old.history.length+1){setRecent(v.history.length);const t=setTimeout(()=>setRecent(0),1200);return()=>clearTimeout(t);}
 },[v.matchId,v.history.length]);
 React.useLayoutEffect(()=>{const animate=motion&&!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const scene=root.current?.closest<HTMLElement>('.table-scene'),animations:Animation[]=[];
  root.current?.querySelectorAll<HTMLElement>('[data-play]').forEach(el=>{const p=plays.find(p=>p.card.id===el.dataset.play)!;const key=v.matchId+':'+p.card.id,target=el.getBoundingClientRect();
   const origin=scene?.dataset,source=p.seat===seat&&origin?.originCard===p.card.id?{x:Number(origin.originX),y:Number(origin.originY)}:scene?.querySelector<HTMLElement>(`[data-seat="${p.seat}"]`)?.getBoundingClientRect();
   if(animate&&el.animate&&source&&!seen.current.has(key))animations.push(el.animate([{translate:`${source.x-target.x}px ${source.y-target.y}px`,scale:'.7',opacity:.4},{translate:'0px 0px',scale:'1',opacity:1}],{duration:240}));
   seen.current.add(key);
  });
  const gatherKey=v.matchId+':'+recent;
  if(completed&&gathered.current!==gatherKey){gathered.current=gatherKey;const pile=scene?.querySelector<HTMLElement>('.center>.pile .pile-stack')?.getBoundingClientRect();
   root.current?.querySelectorAll<HTMLElement>('[data-play]').forEach(el=>{const r=el.getBoundingClientRect();if(animate&&pile&&el.animate)animations.push(el.animate([{translate:'0px 0px',scale:'1',opacity:1},{translate:`${pile.x+pile.width/2-r.x-r.width/2}px ${pile.y+pile.height/2-r.y-r.height/2}px`,scale:'.5',opacity:0}],{duration:300,delay:800,fill:'forwards'}));});
  }
  return()=>animations.forEach(a=>a.cancel());
 },[v.matchId,v.revision,recent,motion]);
 return <div ref={root} className="trick-layer" data-completed={completed}>{[0,1,2,3].map(relative=><span key={relative} className={'trick-slot play-'+relative} aria-hidden="true"/>)}{plays.map(p=><div key={p.card.id} data-play={p.card.id} className={'played play-'+((p.seat-seat+4)%4)+(completed&&p.seat===v.winners.at(-1)?' winning-card':'')} aria-label={names[p.seat]+': '+p.card.id+(p.effective!==p.card.rank?' counts as 2':'')}><span className="card-face small"><img src={'/art/house/cards/'+(p.card.rank===14?'A':p.card.rank===13?'K':p.card.rank===12?'Q':p.card.rank===11?'J':p.card.rank)+p.card.suit+'.webp'} alt=""/></span>{p.effective!==p.card.rank&&<small>Counts as 2</small>}</div>)}</div>;
}
export function SarPile({count,collected=false}:{count:number;collected?:boolean}){return <div className="pile" aria-label={count+(collected?' collected Sars':' unclaimed Sars')}><span className="pile-stack" aria-hidden="true">{Array.from({length:Math.min(6,count)},(_,i)=><i key={i} style={{'--stack-index':i} as React.CSSProperties}/>)}</span><strong>{count}{collected?' Sars':''}</strong><small>{collected?'COLLECTED':'SAR PILE'}</small></div>;}
/** Keep the central stack at its previous size until the four-card gather arrives. */
export function AccumulatedPile({v}:{v:View}){
 const previous=useRef(v),[count,setCount]=useState(v.pile);
 useEffect(()=>{const old=previous.current;previous.current=v;if(old.matchId!==v.matchId||v.history.length-old.history.length!==1){setCount(v.pile);return;}
  const t=setTimeout(()=>setCount(v.pile),1120);return()=>clearTimeout(t);
 },[v.matchId,v.history.length,v.pile]);
 return <SarPile count={count}/>;
}
export function HandMotion({v,sorted,motion,active=true}:{v:View;sorted:boolean;motion:boolean;active?:boolean}){
 const positions=useRef(new Map<string,DOMRect>()),oldSort=useRef(sorted);
 React.useLayoutEffect(()=>{if(!active){positions.current.clear();return;}const animations:Animation[]=[];const next=new Map<string,DOMRect>();document.querySelectorAll<HTMLElement>('.hand [data-card]').forEach(el=>{const id=el.dataset.card!,rect=el.getBoundingClientRect(),old=positions.current.get(id);if(motion&&old&&(oldSort.current!==sorted||old.x!==rect.x||old.y!==rect.y)&&el.animate&&!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)animations.push(el.animate([{translate:`${old.x-rect.x}px ${old.y-rect.y}px`},{translate:'0px 0px'}],{duration:180}));next.set(id,rect);});positions.current=next;oldSort.current=sorted;return()=>animations.forEach(a=>a.cancel());},[v.revision,sorted,motion,active]);return null;
}

export function rememberCardOrigin(scene:HTMLDivElement|null,id:string){const card=scene?.parentElement?.querySelector<HTMLElement>(`.hand [data-card="${id}"]`);if(!scene||!card)return;const r=card.getBoundingClientRect();scene.dataset.originCard=id;scene.dataset.originX=String(r.x);scene.dataset.originY=String(r.y);}

/** One collection per event; initial/reconnected snapshots never replay it. */
export function PileCollection({v,motion,names}:{v:View;motion:boolean;names:string[]}){
 const latest=v.collections?.at(-1),previous=useRef({match:v.matchId,sar:latest?.sar??0,history:v.history.length}),root=useRef<HTMLDivElement>(null),[flight,setFlight]=useState<typeof latest>(undefined);
 useEffect(()=>{const old=previous.current;previous.current={match:v.matchId,sar:latest?.sar??0,history:v.history.length};
  if(old.match!==v.matchId||v.history.length-old.history>1){setFlight(undefined);return;}
  if(!latest||latest.sar<=old.sar)return;
  setFlight(latest);const t=setTimeout(()=>setFlight(undefined),1800);return()=>clearTimeout(t);
 },[v.matchId,latest?.sar,v.history.length]);
 React.useLayoutEffect(()=>{if(!flight||!motion||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;const el=root.current,scene=el?.closest('.table-scene'),target=scene?.querySelector(`[data-seat="${flight.recipient}"]`)?.getBoundingClientRect(),source=scene?.querySelector('.center>.pile .pile-stack')?.getBoundingClientRect();if(!el||!target||!source||!el.animate)return;const bounds=scene!.getBoundingClientRect();el.style.left=source.x-bounds.x+'px';el.style.top=source.y-bounds.y+'px';const a=el.animate([{translate:'0px 0px',scale:'1',opacity:0},{translate:'0px 0px',scale:'1',opacity:1,offset:.1},{translate:`${target.x+target.width/2-source.x-source.width/2}px ${target.y+target.height/2-source.y-source.height/2}px`,scale:'.35',opacity:0}],{duration:600,delay:1120,fill:'both'});return()=>a.cancel();},[flight,motion]);
 return flight?<div ref={root} className="collection-flight" role="status"><SarPile count={flight.count} collected/><small>To {names[flight.recipient]||'seat '+(flight.recipient+1)}</small></div>:null;
}

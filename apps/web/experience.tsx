import {tableAudio} from './table-audio.ts';
import {WELCOME_MS,DRAW_ROUND_MS,DEAL_PRESENTATION_MS,CALLER_RESULT_MS,INVALID_HAND_MS,REDEAL_NOTICE_MS} from '../../packages/protocol/presentation.ts';
import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {art} from './art.tsx';
import {rank} from '../../packages/ui/config.ts';
import type {View} from '../../packages/core/index.ts';
export function Pointer(){return <span className="tap-pointer" aria-hidden="true"><svg viewBox="0 0 40 48"><path d="M13 25V7q0-6 6-3v17l3-7q4-3 6 2l2 4q6 0 6 7l-2 14H16L6 30q-2-6 3-6z" fill="#fff3d2" stroke="#a67f3d" strokeWidth="2"/></svg></span>;}
export function SeatTimer({active,remaining,duration,deadline}:{active:boolean;remaining:number;duration:number;deadline?:number}){
 const [now,setNow]=useState(Date.now()),lastTick=useRef('');
 useEffect(()=>{if(!active)return;setNow(Date.now());const id=setInterval(()=>setNow(Date.now()),100);return()=>clearInterval(id);},[active,deadline]);
 const ms=deadline?Math.max(0,deadline-now):remaining*1000,progress=Math.max(0,Math.min(1,ms/duration)),seconds=Math.ceil(ms/1000),color=progress>.5?'#62db94':progress>.25?'#edbf57':'#f16b61';
 useEffect(()=>{if(!active){lastTick.current='';return;}if(ms<=0||progress>.25)return;const key=String(deadline)+':'+seconds;if(lastTick.current===key)return;lastTick.current=key;tableAudio.effect('tick',120);},[active,deadline,seconds,progress<=.25]);
 if(!active)return null;
 return <span role="timer" aria-label={seconds+' seconds remaining'} className={'seat-timer'+(progress<=.25?' urgent':'')}><svg viewBox="0 0 100 100" aria-hidden="true"><circle className="timer-track" cx="50" cy="50" r="46"/><circle className="timer-arc" cx="50" cy="50" r="46" pathLength="100" stroke={color} strokeDasharray="100" strokeDashoffset={100*(1-progress)}/></svg></span>;
}
export function DealerTable({v,motion,container,active,localSeat,hydrated=false,onBusy,onHand,onRoles}:{onRoles?:(ready:boolean)=>void;onBusy?:(busy:boolean)=>void;onHand?:(hand:View['hand']|null)=>void;v:View;hydrated?:boolean;motion:boolean;active:boolean;localSeat:number;container:React.RefObject<HTMLDivElement|null>}){
 const [settledDraw,setSettledDraw]=useState(-1);
 const [drawSlots,setDrawSlots]=useState<Record<number,{left:number;top:number;width:number;height:number}>>({});

 const [flights,setFlights]=useState<{x:number;y:number;id:number;delay:number}[]>([]),[drawing,setDrawing]=useState(-1),[event,setEvent]=useState('idle'),[speech,setSpeech]=useState('');const host=useRef<HTMLDivElement>(null);const lastHand=useRef(v.hand);const mounted=useRef(false);const previous=useRef<{match:string;phase:string;redeals:number}|null>(null);const observed=useRef({revealed:v.revealed,sars:v.history.length});
 useLayoutEffect(()=>{if(drawing<0||!container.current)return;const scene=container.current;const measure=()=>{const bounds=scene.getBoundingClientRect();const slots:Record<number,{left:number;top:number;width:number;height:number}>={};scene.querySelectorAll<HTMLElement>('.center .trick-slot').forEach((el,index)=>{const r=el.getBoundingClientRect();slots[index]={left:r.left-bounds.left,top:r.top-bounds.top,width:r.width,height:r.height};});const all=Object.values(slots);if(all.length===4){const cx=(Math.min(...all.map(r=>r.left))+Math.max(...all.map(r=>r.left+r.width)))/2;const cy=(Math.min(...all.map(r=>r.top))+Math.max(...all.map(r=>r.top+r.height)))/2;const {width,height}=all[0];const gap=12;for(const index of [0,1,2,3]){const x=index===1?width+gap:index===3?-(width+gap):0;const y=index===0?(height+gap)/2:index===2?-(height+gap)/2:0;slots[index]={left:cx+x-width/2,top:cy+y-height/2,width,height};}}setDrawSlots(slots);};measure();const observer=new ResizeObserver(measure);observer.observe(scene);return()=>observer.disconnect();},[drawing,container]);
 useLayoutEffect(()=>{setSettledDraw(-1);if(drawing<0)return;const count=v.opening?.rounds[drawing]?.cards.length||0;const reduced=!motion||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;const timer=setTimeout(()=>setSettledDraw(drawing),reduced?100:Math.max(0,count-1)*380+600);return()=>clearTimeout(timer);},[drawing,v.matchId,motion]);
 useEffect(()=>{const old=observed.current;observed.current={revealed:v.revealed,sars:v.history.length};if(!old.revealed&&v.revealed)setEvent('reveal');else if(v.history.length>old.sars&&v.pile===0)setEvent('collection');else if(v.phase==='calling')setEvent('present');else setEvent('waiting');const t=setTimeout(()=>setEvent('waiting'),1300);return()=>clearTimeout(t);},[v.revealed,v.history.length,v.phase]);
 const reduced=!motion||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 useLayoutEffect(()=>{const first=!mounted.current;mounted.current=true;if(!active||v.phase==='finished'){if(!active)onRoles?.(!v.opening);setDrawing(-1);setFlights([]);setSpeech('');onHand?.(null);onBusy?.(false);return;}const old=previous.current,openingHand=lastHand.current;lastHand.current=v.hand;previous.current={match:v.matchId,phase:v.phase,redeals:v.redeals};if(old?.match===v.matchId&&old.phase===v.phase&&old.redeals===v.redeals)return;
 const table=container.current||host.current?.closest<HTMLElement>('.table-scene');if(!table)return;const bounds=table.getBoundingClientRect();const seats=[...table.querySelectorAll<HTMLElement>('[data-seat]')];
 const schedule:ReturnType<typeof setTimeout>[]=[];setDrawing(-1);setFlights([]);setSpeech('');
 if(first&&hydrated){onRoles?.(true);onHand?.(null);onBusy?.(false);return;}
 onBusy?.(true);
 const invalid=v.phase==='calling'&&v.invalidDeal;
 const wholeHand=invalid?invalid.hand:v.hand;
 const base=(v.phase==='playing'||invalid)?(old?.match===v.matchId&&openingHand.length===5?openingHand:wholeHand.slice(0,5)):[];
 const staged=[...base,...wholeHand.filter(c=>!base.some(b=>b.id===c.id))];onHand?.(base);
 const later=(fn:()=>void,ms:number)=>schedule.push(setTimeout(fn,ms));
 const initial=(!old||old.match!==v.matchId)&&v.opening;let drawDuration=0;
 onRoles?.(!initial);
 if(initial){later(()=>tableAudio.effect('shuffle'),0);const rounds=v.opening!.rounds,indices=rounds.length>3?[0,1,rounds.length-1]:rounds.map((_,i)=>i);setSpeech('Welcome to the table. Let’s find our Rung caller.');indices.forEach((index,n)=>later(()=>{setDrawing(index);const drawCount=v.opening!.rounds[index].cards.length;for(let c=0;c<drawCount;c++)later(()=>tableAudio.effect('place',180),c*380);setSpeech(n?'A tie! One more card for the tied players.':'One card each. Highest card calls Rung.');},WELCOME_MS+n*DRAW_ROUND_MS));drawDuration=WELCOME_MS+indices.length*DRAW_ROUND_MS;later(()=>{tableAudio.effect('reveal');onRoles?.(true);setSpeech(v.opening!.winner===localSeat?'Your card is highest. You call Rung.':'The highest card wins. Our caller chooses Rung.');},drawDuration-1100);later(()=>setDrawing(-1),drawDuration);}
 const fly=(count:5|8)=>{setEvent('shuffle');later(()=>tableAudio.effect('shuffle',200),0);for(let group=0;group<4;group++){later(()=>tableAudio.effect('deal',150),350+group*(count===5?210:180));if(count===8)later(()=>tableAudio.effect('deal',150),1700+group*180);}later(()=>{if(!reduced){const ordered=[...seats].sort((a,b)=>(v.caller-Number(a.dataset.seat)+4)%4-(v.caller-Number(b.dataset.seat)+4)%4);setFlights(ordered.flatMap((el,group)=>{const target=el.getBoundingClientRect();return Array.from({length:count},(_,n)=>({x:target.left+target.width/2-bounds.left,y:target.top+target.height/2-bounds.top,id:Number(el.dataset.seat)*8+n,delay:count===5?group*210+n*55:n<4?group*180+n*55:1350+group*180+(n-4)*55}));}));}setEvent('waiting');},reduced?0:350);};
 const finish=()=>{setFlights([]);setSpeech('');onHand?.(null);onBusy?.(false);};
 if(invalid){
  setSpeech('Rung selected. Let’s finish dealing this hand.');
  later(()=>{setSpeech('Four cards each…');fly(8);},CALLER_RESULT_MS);
  later(()=>{onHand?.(staged.slice(0,9));setSpeech('And four more.');},CALLER_RESULT_MS+1700);
  const full=CALLER_RESULT_MS+DEAL_PRESENTATION_MS;
  later(()=>{setFlights([]);onHand?.(staged);setSpeech('Take a look at your completed hand.');},full);
  later(()=>setSpeech('7+ Rung cards in one hand. This deal is invalid. I’m reshuffling.'),full+INVALID_HAND_MS);
  const retry=full+INVALID_HAND_MS+REDEAL_NOTICE_MS;
  later(()=>{onHand?.([]);setSpeech('Five fresh cards. The same caller chooses Rung again.');fly(5);},retry);
  later(finish,retry+DEAL_PRESENTATION_MS);
 }else if(v.phase==='playing'){
  later(()=>tableAudio.effect('reveal',400),0);
  setSpeech(v.revealed&&v.trump?({S:'Spades',H:'Hearts',D:'Diamonds',C:'Clubs'}[v.trump]+' is the Rung.'): 'Hidden Rung is sealed.');
  later(()=>{setSpeech('Four cards each…');fly(8);},CALLER_RESULT_MS);
  later(()=>{onHand?.(staged.slice(0,9));setSpeech('And four more. Let’s play.');},CALLER_RESULT_MS+1700);
  later(finish,CALLER_RESULT_MS+DEAL_PRESENTATION_MS);
 }else{
  const deal=()=>{setSpeech('Five cards each. Then we choose Rung.');fly(5);later(finish,reduced?0:DEAL_PRESENTATION_MS);};
  if(drawDuration)later(deal,drawDuration);else deal();
 }
 return()=>{schedule.forEach(clearTimeout);onBusy?.(false);};
 },[v.matchId,v.phase,v.redeals,reduced,active]);
 const state=!active?'idle':event==='shuffle'?'shuffle':flights.length?'deal':v.phase==='finished'?(v.scores[localSeat%2]>v.scores[(localSeat+1)%2]?'victory':'defeat'):event==='reveal'?'reveal':event==='collection'?'collection':v.phase==='calling'?'present':'waiting';
 return <><div ref={host} className={'table-host dealer-state-'+state} data-dealer-state={state} aria-label="Decorative dealer, not a player"><img src={art('characters/dealer-seated.webp')} alt="Rung Club dealer host"/><small>{state==='deal'?'Dealing…':state==='shuffle'?'Shuffling…':state==='reveal'?'Rung revealed':state==='collection'?'Pile collected':'Dealer'}</small></div>{speech&&<div className="dealer-speech presentation-speech" role="status"><strong>{speech}</strong></div>}<div className="deal-flights" aria-hidden="true">{flights.map(f=><i key={f.id} style={{'--flight-x':f.x+'px','--flight-y':f.y+'px',animationDelay:f.delay+'ms'} as React.CSSProperties}/>)}</div>{drawing>=0&&v.opening&&<div key={drawing} className="opening-draw" role="status"><strong>{drawing===v.opening.rounds.length-1?'Highest card calls Rung':'Tied highest cards · draw again'}</strong><div>{v.opening.rounds[drawing]?.cards.map((p,index)=><span style={{...drawSlots[(p.seat-localSeat+4)%4],animationDelay:(index*380)+'ms'} as React.CSSProperties} key={p.seat} className={'comparison-seat comparison-'+((p.seat-localSeat+4)%4)+(settledDraw===drawing&&v.opening!.rounds[drawing].eligible.includes(p.seat)?' winner':'')}><img src={art('house/cards/'+rank(p.card.rank)+p.card.suit+'.webp')} alt={(p.seat===localSeat?'Your':(p.seat-localSeat+4)%4===2?'Partner’s':'Opponent’s')+' comparison card: '+rank(p.card.rank)+' of '+p.card.suit}/></span>)}</div><small>{v.opening.winner===localSeat?'You':(v.opening.winner-localSeat+4)%4===2?'Your partner':'Seat '+(v.opening.winner+1)} {v.opening.winner===localSeat?'select':'selects'} Rung{v.opening.rounds.length>1?' · '+v.opening.rounds.length+' draw rounds':''}</small></div>}</>;
}

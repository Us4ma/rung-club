import React,{useEffect,useRef,useState} from 'react';
import type {View,DealSummary} from '../../packages/core/index.ts';
import {rotateRights} from '../../packages/core/seats.ts';
import './deal-celebration.css';
const memory=new Set<string>();
function claim(id:string){
 if(memory.has(id))return false;memory.add(id);
 try{const key='rung:celebrated-deals',seen=JSON.parse(sessionStorage.getItem(key)||'[]') as string[];if(seen.includes(id))return false;sessionStorage.setItem(key,JSON.stringify([...seen,id].slice(-80)));}catch{}
 return true;
}
/** Completed authoritative summaries drive presentation; initial finished snapshots never replay. */
export function DealCelebration({v,motion=true}:{v:View;motion?:boolean}){
 const previous=useRef({id:v.matchId,phase:v.phase}),root=useRef<HTMLElement>(null);
 const [shown,setShown]=useState<DealSummary|null>(null);
 const round=v.table?.rounds.find(r=>r.id===v.matchId);
 useEffect(()=>{
  const old=previous.current;previous.current={id:v.matchId,phase:v.phase};setShown(null);
  if(old.id!==v.matchId||old.phase==='finished'||v.phase!=='finished'||!round||!claim(round.id))return;
  const show=setTimeout(()=>setShown(round),1800);
  const hide=setTimeout(()=>setShown(null),1800+(round.outcome==='kot'||round.outcome==='goon-kot'?2200:2000));
  return()=>{clearTimeout(show);clearTimeout(hide);};
 },[v.matchId,v.phase,round?.id]);
 const kind=shown?.outcome==='kot'?'kot':shown?.outcome==='goon-kot'?'gooh':'normal';
 useEffect(()=>{
  if(!shown)return;const scene=root.current?.closest('.table-scene');if(!scene)return;
  scene.setAttribute('data-celebrating-team',String(shown.winnerTeam));scene.setAttribute('data-celebration-kind',kind);
  return()=>{scene.removeAttribute('data-celebrating-team');scene.removeAttribute('data-celebration-kind');};
 },[shown,kind]);
 if(!shown||shown.id!==v.matchId)return null;
 const team='Team '+(shown.winnerTeam+1),next=rotateRights(shown.caller,shown.dealer,shown.outcome);
 return <aside ref={root} className={'deal-celebration celebration-'+kind+(!motion?' celebration-still':'')} role="status" aria-live="polite" aria-atomic="true" style={{'--celebration-duration':kind==='normal'?'2000ms':'2200ms'} as React.CSSProperties}>
  {kind!=='normal'&&<><span className="celebration-sweep" aria-hidden="true"/><span className="celebration-sparks" aria-hidden="true">· ✧ ·</span></>}
  <strong className="celebration-title">{kind==='normal'?team+' Wins!':kind==='kot'?'KOT':'GOOH KOT'}</strong>
  <span className="celebration-description">{kind==='normal'?'Collected Sars':team+' collected all 13 Sars!'}</span>
  <span className="celebration-score">{shown.sars[0]} <span>—</span> {shown.sars[1]}{kind!=='normal'&&<small>+{shown.points} match points</small>}</span>
  <small className="celebration-next">Team {next.caller%2+1} calls Rung next</small>
 </aside>;
}

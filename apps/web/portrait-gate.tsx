import React,{useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import './portrait-gate.css';

/** Browser tabs cannot force rotation; the modal blocks landscape interaction without unmounting play. */
export function PortraitGate(){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{
  const query=window.matchMedia('(orientation: landscape) and (pointer: coarse) and (max-width: 1366px)');
  let previous:HTMLElement|null=null;
  const update=()=>{
   const node=dialog.current;if(!node)return;
   if(query.matches&&!node.open){previous=document.activeElement as HTMLElement|null;node.showModal();}
   else if(!query.matches&&node.open){node.close();if(previous?.isConnected)previous.focus({preventScroll:true});}
  };
  update();query.addEventListener('change',update);
  return()=>{query.removeEventListener('change',update);dialog.current?.close();};
 },[]);
 return createPortal(<dialog ref={dialog} className="portrait-gate" aria-labelledby="portrait-gate-title" aria-describedby="portrait-gate-description" onCancel={event=>event.preventDefault()}>
  <div className="portrait-gate-content">
   <svg width="54" height="68" viewBox="0 0 54 68" fill="none" aria-hidden="true"><rect x="10" y="2" width="34" height="62" rx="7" stroke="currentColor" strokeWidth="2"/><path d="M21 9h12M24 57h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M3 29v-8m0 0h8m-8 0 7 7M51 39v8m0 0h-8m8 0-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
   <h1 id="portrait-gate-title">Rotate to portrait</h1>
   <p id="portrait-gate-description">Turn your device upright to continue Rung Club.</p>
  </div>
 </dialog>,document.body);
}

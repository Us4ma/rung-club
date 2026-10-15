import React,{useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import {BackButton} from './art.tsx';
import {LobbyMusic} from './lobby-music.ts';
import './sound.css';
export function initialSoundSettings(){
 let saved:any={};try{saved=JSON.parse(localStorage.getItem('settings')||'{}')||{};}catch{}
 return {sound:false,haptic:false,motion:true,...saved,music:saved.lobbyMusicConfigured===true?saved.music!==false:true,musicVolume:Number.isFinite(saved.musicVolume)?Math.max(0,Math.min(1,saved.musicVolume)):.35,lobbyMusicConfigured:true};
}
export function useLobbyAudio({active,enabled,volume}:{active:boolean;enabled:boolean;volume:number}){
 const player=useRef<LobbyMusic|null>(null);
 useEffect(()=>{const music=new LobbyMusic();player.current=music;
  const visibility=()=>music.setForeground(!document.hidden);
  const hide=()=>music.setForeground(false);
  const native=(e:Event)=>music.setForeground((e as CustomEvent).detail?.active===true&&!document.hidden);
  const retry=()=>music.resume();visibility();
  document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',hide);window.addEventListener('pageshow',visibility);window.addEventListener('rung-app-state',native);document.addEventListener('pointerdown',retry);document.addEventListener('keydown',retry);
  return()=>{music.dispose();player.current=null;document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',hide);window.removeEventListener('pageshow',visibility);window.removeEventListener('rung-app-state',native);document.removeEventListener('pointerdown',retry);document.removeEventListener('keydown',retry);};
 },[]);
 useEffect(()=>player.current?.configure(active&&enabled,volume),[active,enabled,volume]);
}
export function SoundDrawer({settings,onChange,onClose}:{settings:any;onChange:(s:any)=>void;onClose:()=>void}){
 const panel=useRef<HTMLElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;panel.current?.focus();return()=>previous?.focus();},[]);
 const volume=Math.round((Number.isFinite(settings.musicVolume)?Math.max(0,Math.min(1,settings.musicVolume)):.35)*100);
 return createPortal(<div className="account-info-layer sound-layer"><button className="account-info-backdrop" aria-label="Close sound settings" onClick={onClose}/><section ref={panel} tabIndex={-1} className="account-info-drawer sound-drawer" role="dialog" aria-modal="true" aria-label="Sound" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();onClose();}if(e.key==='Tab'){const items=panel.current?.querySelectorAll<HTMLElement>('button,input');const first=items?.[0],last=items?.[items.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===panel.current)){e.preventDefault();first?.focus();}}}}><BackButton label="Back to settings" onClick={onClose}/><h2>Sound</h2><div className="sound-controls">{[{key:'music',title:'Lobby music',description:'Music plays only while you are in the lobby.'},{key:'sound',title:'Sound effects',description:'Card and interface sound feedback.'},{key:'haptic',title:'Vibration',description:'Touch feedback on supported devices.'}].map(({key,title,description})=><React.Fragment key={key}><label className="sound-option"><span>{title}<small>{description}</small></span><input type="checkbox" role="switch" aria-label={title} checked={!!settings[key]} onChange={e=>onChange({...settings,[key]:e.target.checked})}/></label>{key==='music'&&<label className="music-volume"><span>Music volume <output>{volume}%</output></span><input type="range" min="0" max="100" step="1" aria-label="Music volume" value={volume} onChange={e=>onChange({...settings,musicVolume:Number(e.target.value)/100})}/></label>}</React.Fragment>)}</div></section></div>,document.body);
}

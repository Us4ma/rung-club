import {TUTORIAL_AVAILABLE} from '../../packages/protocol/avatars.ts';
import {Pointer} from './experience.tsx';
import {BAND_UNLOCK_XP} from '../../packages/protocol/progression.ts';
import './lobby-compact.css';
import {useEffect,useRef,useState} from 'react';
import {art,Icon,Dealer} from './art.tsx';
type Mode='open'|'band';
function PrivateTableArt(){return <svg className="lobby-private-art" viewBox="0 0 220 180" aria-hidden="true" focusable="false">
 <defs>
  <linearGradient id="private-wall" x2="0" y2="1"><stop stopColor="#523249"/><stop offset="1" stopColor="#211821"/></linearGradient>
  <linearGradient id="private-wood" x2="0" y2="1"><stop stopColor="#a37a44"/><stop offset=".45" stopColor="#533722"/><stop offset="1" stopColor="#302019"/></linearGradient>
  <radialGradient id="private-lamplight"><stop stopColor="#f4cf84" stopOpacity=".4"/><stop offset="1" stopColor="#c68947" stopOpacity="0"/></radialGradient>
  <radialGradient id="private-felt"><stop stopColor="#305647"/><stop offset="1" stopColor="#102c26"/></radialGradient>
 </defs>
 <path d="M29 130V49C29 8 191 8 191 49v81Z" fill="url(#private-wall)" stroke="#a78957" strokeWidth="1.5"/>
 <path d="M40 123V51C40 21 180 21 180 51v72" fill="none" stroke="#b090612e"/>
 <path d="M55 44v66m110-66v66" stroke="#d0b681" strokeOpacity=".15"/>
 <ellipse cx="48" cy="71" rx="38" ry="55" fill="url(#private-lamplight)"/><ellipse cx="172" cy="71" rx="38" ry="55" fill="url(#private-lamplight)"/>
 <g fill="#e5bd75" stroke="#795833" strokeWidth="1.2"><path d="M39 49h18l-4 16H43Z"/><path d="M163 49h18l-4 16h-10Z"/></g>
 <path d="M48 65v15m124-15v15" stroke="#af8954" strokeWidth="2"/>
 <path d="M62 131v28m96-28v28" stroke="#483020" strokeWidth="8"/>
 <ellipse cx="110" cy="130" rx="96" ry="33" fill="url(#private-wood)" stroke="#c2a16b" strokeWidth="2"/>
 <ellipse cx="110" cy="123" rx="88" ry="27" fill="url(#private-felt)" stroke="#d1b57b" strokeWidth="1.5"/>
 <ellipse cx="110" cy="123" rx="76" ry="20" fill="none" stroke="#b59d653b"/>
 <g transform="rotate(-14 90 98)"><image href={art('house/cards/AH.webp')} x="67" y="65" width="44" height="62" preserveAspectRatio="xMidYMid meet"/></g>
 <g transform="rotate(12 125 94)"><image href={art('house/cards/AS.webp')} x="103" y="61" width="44" height="62" preserveAspectRatio="xMidYMid meet"/></g>
 <g fill="#c5a063" stroke="#e0c48d"><ellipse cx="161" cy="127" rx="9" ry="3.5"/><ellipse cx="161" cy="124" rx="9" ry="3.5"/><ellipse cx="161" cy="121" rx="9" ry="3.5"/></g>
 </svg>;}

function ModeArt({mode}:{mode:Mode|'practice'}){if(mode==='open')return <img className="lobby-mode-art" src={art('lobby/open-simple.svg')} alt="" draggable={false}/>;return <img className="lobby-mode-art" src={art(`lobby/${mode}-640.webp`)} srcSet={`${art(`lobby/${mode}-320.webp`)} 320w, ${art(`lobby/${mode}-640.webp`)} 640w`} sizes="(max-width:600px) 30vw, (max-height:550px) 22vw, 25vw" alt="" draggable={false} decoding="async"/>;}
export function Lobby({mode,setMode,play,practice,learn,setScreen,profile,join,setJoin,intro=false,onIntro,matchmakingBusy=false}:{intro?:boolean;onIntro?:()=>void;matchmakingBusy?:boolean;mode:Mode;setMode:(m:Mode)=>void;play:(action:'quick'|'create'|'join',m?:Mode)=>void;practice:()=>void;learn:()=>void;setScreen:(s:string)=>void;profile:{name:string;xp:number};avatar:number;join:string;setJoin:(s:string)=>void}){
 const [rooms,setRooms]=useState(!!join),[locked,setLocked]=useState(false);const unlocked=false,progress=Math.min(BAND_UNLOCK_XP,Math.max(0,profile.xp));
 const roomPanel=useRef<HTMLElement>(null),roomToggle=useRef<HTMLButtonElement>(null);
 function closeRooms(){setRooms(false);roomToggle.current?.focus();}
 useEffect(()=>{if(!rooms)return;function outside(event:PointerEvent){const target=event.target as Node|null;if(target&&!roomPanel.current?.contains(target)&&!roomToggle.current?.contains(target))setRooms(false);}function escape(event:KeyboardEvent){if(event.key==='Escape'){setRooms(false);roomToggle.current?.focus();}}document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};},[rooms]);
 function select(m:Mode){if(m==='band'&&!unlocked)setLocked(true);else if(m==='open'&&intro)onIntro?.();else setMode(m);}
 return <main className="lobby compact-lobby"><div className="house-content"><div className="lobby-arrangement"><aside className="lobby-host"><Dealer/></aside><div className="lobby-table-surface"><div className="lobby-table-front" aria-hidden="true"><div className="table-coins"><i/><i/><i/><i/></div><div className="table-deck"><img src={art('house/cards/AS.webp')} alt=""/><img src={art('house/cards/7H.webp')} alt=""/></div></div><section className="lobby-play-area" aria-label="Rung Club game modes">
 {intro&&<div className="ftue-welcome" role="status">Welcome to Rung Club! Tap Open Rung to play your first hand.</div>}
 <div className="game-menu" aria-label="Choose your table">{(['open','band'] as const).map(m=><article key={m} className={'game-tile '+m+(mode===m?' chosen':'')}>
 <div className="mode-ribbon">{m==='band'&&!unlocked?<><Icon name="lock"/>Coming soon</>:null}</div>
 <button className={'mode-tile '+m+(intro&&m==='open'?' ftue-target':'')} aria-pressed={mode===m} aria-label={m==='open'?'Select Open Rung':'Select Band Rung'} onClick={()=>select(m)}><ModeArt mode={m}/><h2>{m==='open'?'Open Rung':'Band Rung'}</h2><p>{m==='open'?'5-Sar Double Rung':'Hidden trump'}</p>{intro&&m==='open'&&<Pointer/>}</button>

 <div className="mode-status">{m==='band'&&!unlocked?<><small>Hidden trump tables are on their way.</small></>:m==='open'&&matchmakingBusy?<small role="status">Finding an open table and preparing players…</small>:<span aria-hidden="true"/>}</div>
 <button className={'mode-play '+(m==='band'&&!unlocked?'locked':'gold')} disabled={m==='open'&&matchmakingBusy} aria-label={m==='open'?(matchmakingBusy?'Finding your table':'Select an Open Rung table'):unlocked?'Play Band Rung':'Band Rung coming soon'} onClick={()=>m==='band'&&!unlocked?setLocked(true):play('quick',m)}>{m==='band'&&!unlocked?'Coming soon':matchmakingBusy&&m==='open'?'Finding table…':m==='open'?'Select a table':'Play'}</button>
 </article>)}<div className="lobby-side-modes">
 <article className="game-tile practice compact-mode" aria-labelledby="lobby-practice-title"><ModeArt mode="practice"/><div className="compact-mode-copy"><h2 id="lobby-practice-title">Practice</h2><p>Build your card skills</p><button type="button" className="compact-mode-action" onClick={practice}>Play</button></div></article>
 <article className={'game-tile private compact-mode'+(rooms?' chosen':'')} aria-labelledby="lobby-private-title"><PrivateTableArt/><div className="compact-mode-copy"><h2 id="lobby-private-title">Private Table</h2><p>Play with friends</p><button type="button" ref={roomToggle} className="compact-mode-action" aria-expanded={rooms} aria-controls="lobby-private-room" onClick={()=>setRooms(!rooms)}>{rooms?'Close Private Table':'Create / Join Private Table'}</button></div></article>
 </div></div>
 {TUTORIAL_AVAILABLE&&<div className="club-shortcuts"><button onClick={learn} aria-label="Learn the art of Rung"><Icon name="question"/><span><strong>Learn Rung</strong><small>Tutorial & rules</small></span></button></div>}
 {rooms&&<section ref={roomPanel} id="lobby-private-room" className="private-room" aria-label="Private room"><button type="button" className="private-room-dismiss" aria-label="Close private table options" onClick={closeRooms}><span aria-hidden="true">×</span></button><div><h3>Your friends. Your table.</h3><p>{mode==='open'?'Open Rung':'Band Rung'} · share an invite code</p></div><button onClick={()=>play('create')}>Create Private Room</button><div className="join"><input aria-label="Room code" value={join} maxLength={8} onChange={e=>setJoin(e.target.value.toUpperCase())} placeholder="Invite code"/><button onClick={()=>play('join')}>Join</button></div></section>}
 </section></div></div></div>
 {locked&&<div className="unlock-modal" role="dialog" aria-label="Band Rung locked"><section><span className="eyebrow">THE HIDDEN TRUMP CHALLENGE</span><h2>Coming soon</h2><p>Band Rung is temporarily unavailable. Open Rung and Practice are ready to play.</p><button className="gold" onClick={()=>setLocked(false)}>Back to the lobby</button></section></div>}
 </main>;
}


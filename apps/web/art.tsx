import {validAvatar,randomAvatar} from '../../packages/protocol/avatars.ts';
import {TABLE_REACTIONS} from '../../packages/protocol/emotes.ts';
import React from 'react';
export const art=(path:string)=>'/art/'+path;
export function Icon({name}:{name:string}){return <img className="ui-icon" src={art('ui/icons/'+name+'.svg')} alt="" aria-hidden="true"/>;}
export function Avatar({index=1}:{index?:number}){return <img className="avatar" style={{objectFit:'cover',objectPosition:['50% 0%','50% 3%','50% 0%','50% 4%','50% 7%'][normaliseAvatar(index)-1]}} src={art('avatars/roster-v2/avatar_'+String(normaliseAvatar(index)).padStart(2,'0')+'.webp')} alt=""/>;}
export function Dealer({small=false}:{small?:boolean}){return <img className={small?'dealer dealer-small':'dealer'} src={art('characters/dealer-female.webp')} alt="Your Rung Club host" decoding="async"/>;}
export const reactions=TABLE_REACTIONS;
export function Reaction({text}:{text:string}){const r=reactions.find(r=>r.text===text);return r?<img className="reaction-art" src={art('emotes/'+r.asset+'.webp')} alt={text}/>:null;}

export const normaliseAvatar=(index:number)=>validAvatar(index)?index:1;
export function BackButton({onClick,label='Back to lobby'}:{onClick:()=>void;label?:string}){return <button className="quiet back-button" onClick={onClick}><span className="back-chevron" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M12 4L6 10l6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span>{label}</span></button>;}

export function savedLocalAvatar(){const old=Number(localStorage.getItem("avatar:local")||localStorage.getItem("avatar"));const id=validAvatar(old)?old:randomAvatar();localStorage.setItem("avatar:local",String(id));return id;}

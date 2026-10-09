import React from 'react';
export const art=(path:string)=>'/art/'+path;
export function Icon({name}:{name:string}){return <img className="ui-icon" src={art('ui/icons/'+name+'.svg')} alt="" aria-hidden="true"/>;}
export function Avatar({index=1}:{index?:number}){return <img className="avatar" src={art('avatars/avatar_'+String(Math.max(1,Math.min(12,index))).padStart(2,'0')+'.webp')} alt=""/>;}
export function Dealer({small=false}:{small?:boolean}){return <img className={small?'dealer dealer-small':'dealer'} src={art('characters/dealer-female.webp')} alt="Your Rung Club host" decoding="async"/>;}
export const reactions=[{text:'Well played',asset:'applause'},{text:'Good luck',asset:'thumbs_up'},{text:'Nice Sar',asset:'amazed'}];
export function Reaction({text}:{text:string}){const r=reactions.find(r=>r.text===text);return r?<img className="reaction-art" src={art('emotes/'+r.asset+'.webp')} alt={text}/>:null;}

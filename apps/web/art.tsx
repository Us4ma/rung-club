import {validAvatar,randomAvatar,safeAvatarPhoto} from '../../packages/protocol/avatars.ts';
import {TABLE_REACTIONS} from '../../packages/protocol/emotes.ts';
import React from 'react';
import './navigation-controls.css';
export const art=(path:string)=>'/art/'+path;
export function Icon({name}:{name:string}){return <img className="ui-icon" src={art('ui/icons/'+name+'.svg')} alt="" aria-hidden="true"/>;}
export function Avatar({index=1,photo,frame}:{index?:number;photo?:string|null;frame?:string}){const [failed,setFailed]=React.useState(false);React.useEffect(()=>setFailed(false),[photo]);const url=!failed&&safeAvatarPhoto(photo);const bot=index>=6&&index<=9;return <img className={'avatar'+(frame==='emerald-ace'||frame==='royal-crown'?' reward-frame-'+frame:'')} style={{objectFit:'cover',objectPosition:url||bot?'50% 50%':['50% 0%','50% 3%','50% 0%','50% 4%','50% 7%'][normaliseAvatar(index)-1]}} src={url||art(bot?'avatars/ai-suits/suit_'+(index-5)+'.svg':'avatars/roster-v2/avatar_'+String(normaliseAvatar(index)).padStart(2,'0')+(normaliseAvatar(index)===4?'-v3':'')+'.webp')} referrerPolicy="no-referrer" onError={()=>{if(url)setFailed(true);}} alt=""/>;}

export function Dealer({small=false}:{small?:boolean}){return <img className={small?'dealer dealer-small':'dealer'} src={art('characters/dealer-female.webp')} alt="Your Rung Club host" decoding="async"/>;}
export const reactions=TABLE_REACTIONS;
export function Reaction({text}:{text:string}){const emoji:Record<string,string>={'Well played':'🫡','Good luck':'👍🏻','Nice Sar':'😎','Haha!':'😂','Thinking…':'🤔','Love it':'❤️'};if(text==='Cheeky Devil')return <span className="reaction-art reaction-emoji" role="img" aria-label={text}>😈</span>;if(text==='Royal Applause')return <span className="reaction-art reaction-emoji" role="img" aria-label={text}>👏</span>;return emoji[text]?<span className="reaction-art reaction-emoji" role="img" aria-label={text}>{emoji[text]}</span>:null;}

export const normaliseAvatar=(index:number)=>validAvatar(index)?index:1;
export function BackButton({onClick,label='Back to lobby'}:{onClick:()=>void;label?:string}){return <button type="button" className="quiet back-button house-nav-back" onClick={onClick}><span className="back-chevron" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M12 4L6 10l6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span>{label}</span></button>;}

export function savedLocalAvatar(){const old=Number(localStorage.getItem("avatar:local")||localStorage.getItem("avatar"));const id=validAvatar(old)?old:randomAvatar();localStorage.setItem("avatar:local",String(id));return id;}

/** Room code randomizes bot suit portraits; all clients derive the same stable choice. */
export function botAvatarFor(name:string,room:string){let h=2166136261;for(const c of room+':'+name)h=Math.imul(h^c.charCodeAt(0),16777619);return 6+((h>>>0)%4);}
export function randomBotAvatar(){const n=new Uint32Array(1);crypto.getRandomValues(n);return 6+n[0]%4;}


export function HelpButton({label='Help',className='',...props}:{label?:string}&React.ButtonHTMLAttributes<HTMLButtonElement>){return <button {...props} type="button" className={'quiet icon-button house-nav-icon '+className} aria-label={label}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17h.01"/></svg></button>;}
export function CloseButton({label='Close',className='',...props}:{label?:string}&React.ButtonHTMLAttributes<HTMLButtonElement>){return <button {...props} type="button" className={'quiet icon-button house-nav-icon house-nav-close '+className} aria-label={label}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>;}

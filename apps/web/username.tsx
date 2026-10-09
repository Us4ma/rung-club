import {useRef,useState} from 'react';
import {restoredIdentity} from './auth.ts';
import {ONLINE_ORIGIN,cloudHost} from './deployment.ts';
export async function accountProfile(name?:string){
 const user=await restoredIdentity();if(!user)throw Error('Please sign in before choosing a username.');
 const token=await user.getIdToken();
 const url=import.meta.env.PROD&&!cloudHost?ONLINE_ORIGIN+'/api/identity':'/api/identity';
 const r=await fetch(url,{method:name===undefined?'GET':'PATCH',headers:{Authorization:'Bearer '+token,...(name===undefined?{}:{'Content-Type':'application/json'})},...(name===undefined?{}:{body:JSON.stringify({name})})});
 const data=await r.json();if(!r.ok)throw Error(data.error||'Unable to connect. Please retry.');return data;
}
export function UsernameForm({initial='',onSaved,onCancel,standalone=false}:{initial?:string;onSaved:(data:any)=>void;onCancel?:()=>void;standalone?:boolean}){
 const [name,setName]=useState(initial),[busy,setBusy]=useState(false),[message,setMessage]=useState('');const pending=useRef(false);
 return <section className={'username-form'+(standalone?' username-welcome':'')} aria-label="Choose your username">{standalone&&<><span className="eyebrow">YOUR PLAYER IDENTITY</span><h1>A name for the table.</h1><p>Choose a unique username. It appears in your profile and online games.</p></>}<form onSubmit={async e=>{e.preventDefault();if(pending.current)return;pending.current=true;setBusy(true);setMessage('');try{onSaved(await accountProfile(name.trim()));setMessage('Username saved.');}catch(e){setMessage(e instanceof Error?e.message:'Unable to save. Please retry.');}finally{pending.current=false;setBusy(false);}}}><label htmlFor="club-username">Username</label><div className="username-controls"><input id="club-username" required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]{3,20}" autoComplete="nickname" value={name} onChange={e=>setName(e.target.value)} disabled={busy} placeholder="Your table name"/><button className="gold" type="submit" disabled={busy}>{busy?'Saving…':standalone?'Take my seat':'Save username'}</button></div><small>3–20 letters, numbers or underscores. Names are unique, regardless of capitals.</small>{message&&<p role="status">{message}</p>}</form>{onCancel&&<button className="quiet" disabled={busy} onClick={onCancel}>Sign out</button>}</section>;
}

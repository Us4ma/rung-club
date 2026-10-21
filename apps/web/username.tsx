import {withRequestTimeout} from './request-timeout.ts';
import {deviceHeaders} from './device-session.ts';
import {useRef,useState} from 'react';
import {restoredIdentity} from './auth.ts';
import {ONLINE_ORIGIN} from './deployment.ts';
export async function accountProfile(name?:string,tutorialStatus?:import('../../packages/protocol/progression.ts').TutorialStatus,bandUnlockSeen?:boolean,avatar?:number,avatarSource?:'google',practiceDifficulty?:'beginner'|'intermediate'|'advanced'){
 const user=await restoredIdentity();if(!user)throw Error('Please sign in before choosing a name.');
 let token=await user.getIdToken();
 // Browser requests use the same-origin proxy; packaged Android still uses the Worker.
 const native=location.protocol==='capacitor:'||(location.protocol==='https:'&&location.hostname==='localhost');
 const url=(native?ONLINE_ORIGIN:'')+'/api/identity';
 const legacy=Number(localStorage.getItem('avatar'));const target=url+(legacy>=1&&legacy<=5?'?legacyAvatar='+legacy:'');
 const readOnly=name===undefined&&tutorialStatus===undefined&&bandUnlockSeen===undefined&&avatar===undefined&&avatarSource===undefined&&practiceDifficulty===undefined;
 for(let attempt=0;attempt<3;attempt++){
  let r:Response;let data:any;
  try{
   ({r,data}=await withRequestTimeout(async signal=>{
    const r=await fetch(target,{method:readOnly?'GET':'PATCH',signal,headers:{...deviceHeaders(),Authorization:'Bearer '+token,...(readOnly?{}:{'Content-Type':'application/json'})},...(readOnly?{}:{body:JSON.stringify({name,tutorialStatus,bandUnlockSeen,avatar,avatarSource,practiceDifficulty})})});
    const data=await r.json();
    return {r,data};
   },30000));
  }catch{
   if(readOnly&&attempt<2){await new Promise(resolve=>setTimeout(resolve,750*(attempt+1)));continue;}
   throw Error('The profile service could not be reached. Check your connection and tap Reconnect; your account is safe.');
  }
  if(r.status===401&&attempt===0){token=await user.getIdToken(true);continue;}
  if(readOnly&&attempt<2&&[408,429,500,502,503,504].includes(r.status)){
   await new Promise(resolve=>setTimeout(resolve,750*(attempt+1)));continue;
  }
  if(!r.ok)throw Object.assign(Error(data?.error||'Profile service unavailable ('+r.status+'). Please retry.'),{code:data?.code});
  if(!data?.user?.uid)throw Error('The profile service returned an incomplete profile. Please retry.');
  return data;
 }
 throw Error('Unable to load your profile. Please retry.');
}
export function UsernameForm({initial='',onSaved,onCancel,standalone=false,cancelLabel='Sign out',autoFocus=false}:{initial?:string;onSaved:(data:any)=>void;onCancel?:()=>void;standalone?:boolean;cancelLabel?:string;autoFocus?:boolean}){
 const [name,setName]=useState(initial),[busy,setBusy]=useState(false),[message,setMessage]=useState('');const pending=useRef(false);
 return <section className={'username-form'+(standalone?' username-welcome':'')} aria-label="Choose your name">{standalone&&<><span className="eyebrow">YOUR PLAYER IDENTITY</span><h1>A name for the table.</h1><p>Choose your name. It appears in your profile and online games.</p></>}<form onSubmit={async e=>{e.preventDefault();if(pending.current)return;pending.current=true;setBusy(true);setMessage('');try{onSaved(await accountProfile(name.trim()));setMessage('Name saved.');}catch(e){setMessage(e instanceof Error?e.message:'Unable to save. Please retry.');}finally{pending.current=false;setBusy(false);}}}><label htmlFor="club-username">Name</label><div className="username-controls"><input id="club-username" autoFocus={autoFocus} required minLength={3} maxLength={40}  autoComplete="nickname" value={name} onChange={e=>setName(e.target.value)} disabled={busy} placeholder="Your table name"/><button className="gold" type="submit" disabled={busy}>{busy?'Saving…':standalone?'Take my seat':'Save name'}</button></div><small>3–40 letters, numbers, spaces or simple punctuation. Names are unique, regardless of capitals.</small>{message&&<p role="status">{message}</p>}</form>{onCancel&&<button className="quiet" disabled={busy} onClick={onCancel}>{cancelLabel}</button>}</section>;
}

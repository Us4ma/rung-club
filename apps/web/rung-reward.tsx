import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {art,BackButton} from './art.tsx';
import {socialRequest} from './friends.tsx';
import {levelProgress} from '../../packages/protocol/progression.ts';
import {MILESTONES,rewardCoins,type RewardState} from '../../packages/protocol/level-rewards.ts';
import './rung-rewards.css';
export const equippedRewardFrame=(owned:{item:string}[]=[])=>(owned.find(r=>r.item.startsWith('equipped:frame:'))?.item.slice(9)||'').replace('frame:','');
const FAQ=[['How do I unlock rewards?','Every account level unlocks a coin reward. Earn XP by completing eligible online deals. Level 50 unlocks the Emerald Ace frame, 100 the Cheeky Devil emote, 150 Royal Applause, and 200 the Royal Crown frame.'],['What does Claim All do?','It collects every unlocked, unclaimed level reward in one action, including milestone cosmetics. Each level can be claimed once per account.'],['Do earlier levels count?','Yes. Your existing account XP unlocks all earlier level rewards. Rewards do not expire, and claimed rewards stay claimed across devices.'],['Where can I use cosmetics?','Equip your claimed frames in Profile customization. Claimed special emotes appear in the table reaction picker. Cosmetics never change cards, rules or winning chances.'],['Do rewards count toward leagues?','No. Reward coins go into your wallet but do not count as competitive earnings, wins, Sars or XP. Practice progress does not unlock account rewards.']];
export function RewardArt({level}:{level:number}){const m=MILESTONES.find(m=>m.level===level);return m?<div className={'reward-special-art '+m.item.replace(':','-')} aria-hidden="true">{m.kind==='frame'?<span className="reward-frame-preview">{m.symbol}</span>:m.level===100?<span className="exclusive-reward-emoji">😈</span>:<span className="exclusive-reward-emoji">👏</span>}</div>:<div className="reward-coins-art" aria-hidden="true"><img src="/art/currency/stack-1000.svg" alt=""/></div>;}
export function RungReward({uid,xp=0}:{uid?:string;xp?:number}){
 const [open,setOpen]=useState(false),[faq,setFAQ]=useState(false),[data,setData]=useState<RewardState|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[edges,setEdges]=useState({left:false,right:true});
 const trigger=useRef<HTMLButtonElement>(null),panel=useRef<HTMLElement>(null),carousel=useRef<HTMLDivElement>(null),scope=useRef(uid),request=useRef(0),pending=useRef(false);scope.current=uid;
 async function refresh(){if(!uid||pending.current)return;const account=uid,id=++request.current;pending.current=true;try{const result=await socialRequest('rewards');if(scope.current===account&&id===request.current){setData(result);setError('');}}catch(e){if(scope.current===account)setError((e as Error).message);}finally{pending.current=false;}}
 useEffect(()=>{setData(null);setError('');request.current++;pending.current=false;setBusy(false);void refresh();},[uid]);
 useEffect(()=>{void refresh();},[xp]);
 useEffect(()=>{if(!uid)return;const update=()=>{if(!document.hidden)void refresh();};window.addEventListener('focus',update);document.addEventListener('visibilitychange',update);const timer=setInterval(update,30000);return()=>{clearInterval(timer);window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',update);};},[uid]);
 const level=data?.level??levelProgress(xp).level,ready=data?Array.from({length:data.level},(_,i)=>i+1).filter(n=>!data.claimed.includes(n)):[];
 function updateEdges(){const el=carousel.current;if(el)setEdges({left:el.scrollLeft>4,right:el.scrollLeft+el.clientWidth<el.scrollWidth-4});}
 function go(n:number,instant=false){const el=carousel.current,node=el?.querySelector<HTMLElement>(`[data-reward-level="${n}"]`);if(!el||!node)return;const left=el.scrollLeft+node.getBoundingClientRect().left-el.getBoundingClientRect().left-(el.clientWidth-node.clientWidth)/2;el.scrollTo({left,behavior:instant||window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});requestAnimationFrame(updateEdges);}
 function move(direction:number){const el=carousel.current;if(!el)return;const card=el.querySelector<HTMLElement>('.level-reward-card');el.scrollBy({left:direction*((card?.offsetWidth||200)+24),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
 useEffect(()=>{if(!open)return;const observer=new ResizeObserver(updateEdges);if(carousel.current)observer.observe(carousel.current);window.addEventListener('resize',updateEdges);return()=>{observer.disconnect();window.removeEventListener('resize',updateEdges);};},[open,faq,!!data]);
 useEffect(()=>{if(open&&!faq&&data){const id=requestAnimationFrame(()=>go(level,true));return()=>cancelAnimationFrame(id);}},[open,faq,!!data]);
 useEffect(()=>{if(!open)return;setMessage('');void refresh();const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;document.body.style.overflow='hidden';panel.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();if(faq)setFAQ(false);else setOpen(false);}if(e.key==='Tab'){const nodes=[...(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),summary,[tabindex="0"]')||[])].filter(n=>n.getClientRects().length);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===panel.current)){e.preventDefault();first?.focus();}}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);(previous||trigger.current)?.focus();};},[open,faq]);
 async function act(body:object){if(busy||!uid)return;const account=uid;request.current++;pending.current=true;setBusy(true);setError('');try{const result=await socialRequest('rewards',body);if(scope.current!==account)return;setData(result);setMessage('Rewards saved to your account.');window.dispatchEvent(new Event('rung:rewards-changed'));}catch(e){if(scope.current===account)setError((e as Error).message);}finally{pending.current=false;setBusy(false);}}
 return <>
  <button type="button" ref={trigger} className="rung-reward-entry" aria-label={'Rung Rewards'+(ready.length?`, ${ready.length} unclaimed rewards`:'')} aria-haspopup="dialog" aria-expanded={open} onClick={()=>{setFAQ(false);setOpen(true);}}>
   <img src={art('lobby/rung-reward-clean.webp')} alt="" draggable={false}/><span>Rung Rewards</span>{ready.length>0&&<i className="reward-notification" aria-hidden="true"/>}
  </button>
  {open&&createPortal(
   <div className="rung-rewards-overlay">
    <section className={'rung-rewards-page'+(faq?' showing-faq':'')} ref={panel} role="dialog" aria-modal="true" aria-labelledby="rewards-title" tabIndex={-1}>
     <div className="rewards-room-art" aria-hidden="true"><img className="rewards-host" src={art('characters/dealer-female.webp')} alt=""/><div className="rewards-table-rail"/></div>
     <header className="rewards-heading">
      <div className="rewards-header-left"><BackButton label={faq?'Rewards':'Lobby'} onClick={()=>faq?setFAQ(false):setOpen(false)}/>{data&&<span className="rewards-wallet"><img src="/art/currency/coin.svg" alt="Coins"/>{data.wallet.toLocaleString()}</span>}</div>
      <h1 id="rewards-title">{faq?'Rewards FAQ':'Rung Rewards'}</h1>
      <div className="rewards-header-actions"><button className="rewards-icon-button" aria-label="Rewards FAQ" aria-pressed={faq} onClick={()=>setFAQ(!faq)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17h.01"/></svg></button><button className="rewards-icon-button" aria-label="Close rewards" onClick={()=>setOpen(false)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
     </header>
     {faq?<div className="rewards-faq">{FAQ.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>:!uid?<div className="rewards-empty"><p>Sign in to earn and claim account rewards.</p><small>Local practice does not unlock rewards.</small></div>:!data?<div className="rewards-empty" role="status"><p>{error||'Opening your rewards…'}</p><button className="reward-claim" onClick={()=>void refresh()}>Retry</button></div>:<>
      <div className="rewards-stage">
       <div className="rewards-track-window">
        <button className="rewards-carousel-arrow arrow-previous" aria-label="Previous rewards" disabled={!edges.left} onClick={()=>move(-1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 4-8 8 8 8"/></svg></button>
        <div className="rewards-carousel" ref={carousel} tabIndex={0} aria-label="Rewards carousel" onScroll={updateEdges} onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}}}>
         {Array.from({length:Math.max(200,level+10)},(_,i)=>i+1).map(n=>{const claimed=data.claimed.includes(n),locked=n>level,m=MILESTONES.find(m=>m.level===n);return (
          <article key={n} data-reward-level={n} aria-label={`Reward ${n}${locked?', locked':claimed?', claimed':', available'}`} className={'level-reward-card '+(locked?'is-locked':claimed?'is-claimed':'is-ready')}>
           <div className="reward-card-status">{locked?<><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><span>Locked</span></>:claimed?<span>✓ Collected</span>:<span>Ready to collect</span>}</div>
           <div className="reward-prize"><RewardArt level={1}/><strong>{rewardCoins(n).toLocaleString()}</strong><span>Rung Coins</span></div>
           {m?<div className="reward-bonus"><span className="reward-bonus-plus">+</span><RewardArt level={n}/><div><small>EXTRA REWARD</small><strong>{m.name}</strong><span>{m.kind==='frame'?'Avatar frame':'Exclusive emoji'}</span></div></div>:<div className="reward-card-flourish" aria-hidden="true">♠</div>}
           <button className="reward-claim" disabled={locked||claimed||busy} onClick={()=>void act({action:'claim',level:n})}>{locked?'Locked':claimed?'Claimed':'Claim'}</button>
           <span className="reward-number" aria-label={'Level '+n}>{n}</span>
          </article>
         );})}
        </div>
        <button className="rewards-carousel-arrow arrow-next" aria-label="Next rewards" disabled={!edges.right} onClick={()=>move(1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 4 8 8-8 8"/></svg></button>
       </div>
      </div>
      <footer className="rewards-footer"><div className="rewards-footer-copy"><strong>{ready.length?`${ready.length} reward${ready.length===1?'':'s'} ready`:'You’re all caught up'}</strong><small>{ready.length?'Collect your coins and any extra rewards.':'Your next reward unlocks as you play.'}</small></div><button className="reward-claim reward-claim-all" disabled={!ready.length||busy} onClick={()=>void act({action:'claim-all'})}>{busy?'Collecting…':'Claim All'}</button><p className="rewards-feedback" role={error?'alert':'status'}>{error||message}</p></footer>
     </>}
    </section>
   </div>,document.body
  )}
 </>;

}
export function RewardCosmetics({owned=[],onChange}:{owned?:{item:string}[];onChange:()=>void}){const [busy,setBusy]=useState(false),[error,setError]=useState('');const current=equippedRewardFrame(owned);async function equip(item:string){setBusy(true);try{await socialRequest('rewards',{action:'equip',item});onChange();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}return <div className="reward-profile-cosmetics"><h3>Milestone frames</h3><div><button disabled={busy} aria-pressed={!current} onClick={()=>void equip('')}>No frame</button>{MILESTONES.filter(m=>m.kind==='frame').map(m=><button key={m.item} disabled={busy||!owned.some(o=>o.item===m.item)} aria-pressed={current===m.item.slice(6)} onClick={()=>void equip(m.item)}><RewardArt level={m.level}/>{m.name}<small>{owned.some(o=>o.item===m.item)?current===m.item.slice(6)?'Equipped':'Equip':'Claim at level '+m.level}</small></button>)}</div>{error&&<p role="alert">{error}</p>}</div>;}


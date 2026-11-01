import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {art,BackButton,HelpButton,CloseButton} from './art.tsx';
import {socialRequest} from './friends.tsx';
import {levelProgress} from '../../packages/protocol/progression.ts';
import {MILESTONES,rewardCoins,type RewardState} from '../../packages/protocol/level-rewards.ts';
import {tableAudio} from './table-audio.ts';
import {compactCoins} from './coin-format.ts';
import './rung-rewards.css';
export const equippedRewardFrame=(owned:{item:string}[]=[])=>(owned.find(r=>r.item.startsWith('equipped:frame:'))?.item.slice(9)||'').replace('frame:','');
const FAQ=[['How do I unlock rewards?','Every account level unlocks a coin reward. Earn XP by completing eligible online deals. Level 50 unlocks the Emerald Ace frame, 100 the Cheeky Devil emote, 150 Royal Applause, and 200 the Royal Crown frame.'],['What does Claim All do?','It collects every unlocked, unclaimed level reward in one action, including milestone cosmetics. Each level can be claimed once per account.'],['Do earlier levels count?','Yes. Your existing account XP unlocks all earlier level rewards. Rewards do not expire, and claimed rewards stay claimed across devices.'],['Where can I use cosmetics?','Equip your claimed frames in Profile customization. Claimed special emotes appear in the table reaction picker. Cosmetics never change cards, rules or winning chances.'],['Do rewards count toward leagues?','No. Reward coins go into your wallet but do not count as competitive earnings, wins, Sars or XP. Practice progress does not unlock account rewards.']];
export function RewardArt({level}:{level:number}){const m=MILESTONES.find(m=>m.level===level);return m?<div className={'reward-special-art '+m.item.replace(':','-')} aria-hidden="true">{m.kind==='frame'?<span className="reward-frame-preview">{m.symbol}</span>:m.level===100?<span className="exclusive-reward-emoji">😈</span>:<span className="exclusive-reward-emoji">👏</span>}</div>:<div className="reward-coins-art" aria-hidden="true"><img src="/art/currency/stack-1000.svg" alt=""/></div>;}
export function RungReward({uid,xp=0,sound=false}:{uid?:string;xp?:number;sound?:boolean}){
 const [open,setOpen]=useState(false),[faq,setFAQ]=useState(false),[data,setData]=useState<RewardState|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[edges,setEdges]=useState({left:false,right:true});
 const [flight,setFlight]=useState<{x:number;y:number;dx:number;dy:number;id:number}|null>(null),[visibleWallet,setVisibleWallet]=useState<number|null>(null),[walletAdded,setWalletAdded]=useState(0);
 const walletTarget=useRef<HTMLSpanElement>(null),live=useRef(true);
 useEffect(()=>{live.current=true;return()=>{live.current=false;};},[]);
 useEffect(()=>{if(!flight)setVisibleWallet(data?.wallet??null);},[data?.wallet,!!flight]);
 const trigger=useRef<HTMLButtonElement>(null),panel=useRef<HTMLElement>(null),carousel=useRef<HTMLDivElement>(null),scope=useRef(uid),request=useRef(0),pending=useRef(false),navigationTarget=useRef<number|null>(null),edgeFrame=useRef(0),drag=useRef<{id:number;x:number;scroll:number;lastX:number;at:number;velocity:number;active:boolean}|null>(null),ignoreClickUntil=useRef(0);scope.current=uid;
 async function refresh(){if(!uid||pending.current)return;const account=uid,id=++request.current;pending.current=true;try{const result=await socialRequest('rewards');if(scope.current===account&&id===request.current){setData(result);setError('');}}catch(e){if(scope.current===account)setError((e as Error).message);}finally{pending.current=false;}}
 useEffect(()=>{setData(null);setError('');request.current++;pending.current=false;setBusy(false);void refresh();},[uid]);
 useEffect(()=>{void refresh();},[xp]);
 useEffect(()=>{if(!uid)return;const update=()=>{if(!document.hidden)void refresh();};window.addEventListener('focus',update);document.addEventListener('visibilitychange',update);const timer=setInterval(update,30000);return()=>{clearInterval(timer);window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',update);};},[uid]);
 const level=data?.level??levelProgress(xp).level,ready=data?Array.from({length:data.level},(_,i)=>i+1).filter(n=>!data.claimed.includes(n)):[];
 function updateEdges(){const el=carousel.current;if(!el)return;const left=el.scrollLeft>4,right=el.scrollLeft+el.clientWidth<el.scrollWidth-4;setEdges(old=>old.left===left&&old.right===right?old:{left,right});}
 function scheduleEdges(){if(edgeFrame.current)return;edgeFrame.current=requestAnimationFrame(()=>{edgeFrame.current=0;updateEdges();});}
 function go(n:number,instant=false){const el=carousel.current,node=el?.querySelector<HTMLElement>(`[data-reward-level="${n}"]`);if(!el||!node)return;navigationTarget.current=n-1;const left=el.scrollLeft+node.getBoundingClientRect().left-el.getBoundingClientRect().left-(el.clientWidth-node.clientWidth)/2;el.scrollTo({left,behavior:instant||window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});requestAnimationFrame(updateEdges);}
 function startDrag(e:React.PointerEvent<HTMLDivElement>){if(e.pointerType!=='mouse'||e.button!==0)return;navigationTarget.current=null;drag.current={id:e.pointerId,x:e.clientX,scroll:e.currentTarget.scrollLeft,lastX:e.clientX,at:performance.now(),velocity:0,active:false};}
 function moveDrag(e:React.PointerEvent<HTMLDivElement>){const d=drag.current;if(!d||d.id!==e.pointerId)return;if(!(e.buttons&1)){finishDrag(e,true);return;}const el=e.currentTarget,now=performance.now();if(!d.active){if(Math.abs(e.clientX-d.x)<6)return;d.active=true;el.style.scrollBehavior='auto';el.style.scrollSnapType='none';el.setPointerCapture(e.pointerId);el.classList.add('is-dragging');}e.preventDefault();const dt=Math.max(1,now-d.at);d.velocity=d.velocity*.35+(d.lastX-e.clientX)/dt*.65;d.lastX=e.clientX;d.at=now;el.scrollLeft=d.scroll+d.x-e.clientX;}
 function finishDrag(e:React.PointerEvent<HTMLDivElement>,cancel=false){const d=drag.current;if(!d||d.id!==e.pointerId)return;drag.current=null;const el=e.currentTarget;if(!d.active)return;ignoreClickUntil.current=Date.now()+250;el.classList.remove('is-dragging');el.style.scrollBehavior='';el.style.scrollSnapType='';if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!cancel&&!reduced&&performance.now()-d.at<100){const velocity=Math.max(-1.8,Math.min(1.8,d.velocity));el.scrollTo({left:el.scrollLeft+velocity*160,behavior:'smooth'});}scheduleEdges();}
 function move(direction:number){const el=carousel.current;if(!el)return;const cards=el.querySelectorAll<HTMLElement>('.level-reward-card'),first=cards[0];if(!first)return;const step=(cards[1]?.offsetLeft??first.offsetLeft+first.offsetWidth)-first.offsetLeft;const nearest=Math.round((el.scrollLeft+el.clientWidth/2-first.offsetLeft-first.offsetWidth/2)/step);const index=Math.max(0,Math.min(cards.length-1,(navigationTarget.current??nearest)+direction));go(index+1);}
 useEffect(()=>{const el=carousel.current;if(!open||!el)return;const interrupt=()=>{navigationTarget.current=null;};el.addEventListener('pointerdown',interrupt,{passive:true});el.addEventListener('wheel',interrupt,{passive:true});return()=>{el.removeEventListener('pointerdown',interrupt);el.removeEventListener('wheel',interrupt);cancelAnimationFrame(edgeFrame.current);edgeFrame.current=0;navigationTarget.current=null;};},[open,faq,!!data]);
 useEffect(()=>{if(!open)return;const observer=new ResizeObserver(updateEdges);if(carousel.current)observer.observe(carousel.current);window.addEventListener('resize',updateEdges);return()=>{observer.disconnect();window.removeEventListener('resize',updateEdges);};},[open,faq,!!data]);
 useEffect(()=>{if(open&&!faq&&data){const id=requestAnimationFrame(()=>go(level,true));return()=>cancelAnimationFrame(id);}},[open,faq,!!data]);
 useEffect(()=>{if(!open)return;setMessage('');void refresh();const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;document.body.style.overflow='hidden';panel.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();if(faq)setFAQ(false);else setOpen(false);}if(e.key==='Tab'){const nodes=[...(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),summary,[tabindex="0"]')||[])].filter(n=>n.getClientRects().length);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===panel.current)){e.preventDefault();first?.focus();}}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);(previous||trigger.current)?.focus();};},[open,faq]);
 async function act(body:object,origin?:HTMLElement){
  if(busy||!uid)return;const account=uid,source=origin?.getBoundingClientRect(),before=data?.wallet??0;request.current++;pending.current=true;setBusy(true);setError('');setWalletAdded(0);
  try{const result:RewardState=await socialRequest('rewards',body);if(!live.current||scope.current!==account)return;
   const added=Math.max(0,result.wallet-before),target=walletTarget.current?.getBoundingClientRect(),reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   if(added>0&&target){const x=source?source.left+source.width/2:innerWidth/2,y=source?source.top:innerHeight*.65;setVisibleWallet(before);setFlight({x,y,dx:target.left+target.width/2-x,dy:target.top+target.height/2-y,id:Date.now()});}
   setData(result);window.dispatchEvent(new Event('rung:rewards-changed'));
   if(added>0&&target){await new Promise<void>(resolve=>setTimeout(resolve,reduced?120:950));if(!live.current||scope.current!==account)return;setVisibleWallet(result.wallet);setFlight(null);setWalletAdded(added);tableAudio.interfaceEffect('coinGift',sound);}
   setMessage(added>0?added.toLocaleString()+' coins added to your wallet.':'Rewards already collected.');
  }catch(e){if(live.current&&scope.current===account)setError((e as Error).message);}finally{pending.current=false;if(live.current)setBusy(false);}
 }

 return <>
  <button type="button" ref={trigger} className="rung-reward-entry" aria-label={'Rung Rewards'+(ready.length?`, ${ready.length} unclaimed rewards`:'')} aria-haspopup="dialog" aria-expanded={open} onClick={()=>{setFAQ(false);setOpen(true);}}>
   <img src={art('lobby/rung-reward-clean.webp')} alt="" draggable={false}/><span>Rung Rewards</span>{ready.length>0&&<i className="reward-notification" aria-hidden="true"/>}
  </button>
  {open&&createPortal(
   <div className="rung-rewards-overlay">
    <section className={'rung-rewards-page'+(faq?' showing-faq':'')} ref={panel} role="dialog" aria-modal="true" aria-labelledby="rewards-title" tabIndex={-1}>
     
     <header className="rewards-heading">
      <div className="rewards-header-left"><BackButton label={faq?'Rewards':'Lobby'} onClick={()=>faq?setFAQ(false):setOpen(false)}/>{data&&<span ref={walletTarget} className={'rewards-wallet'+(walletAdded?' coins-arrived':'')} aria-label={'Wallet: '+(visibleWallet??data.wallet).toLocaleString()+' coins'}><img src="/art/currency/coin.svg" alt=""/><span>{compactCoins(visibleWallet??data.wallet)}</span>{walletAdded>0&&<b key={walletAdded} className="reward-wallet-added" onAnimationEnd={()=>setWalletAdded(0)}>+{compactCoins(walletAdded)}</b>}</span>}</div>
      <h1 id="rewards-title">{faq?'Rewards FAQ':'Rung Rewards'}</h1>
      <div className="rewards-header-actions"><HelpButton label="Rewards FAQ" aria-pressed={faq} onClick={()=>setFAQ(!faq)}/><CloseButton label="Close rewards" onClick={()=>setOpen(false)}/></div>
     </header>
     {faq?<div className="rewards-faq">{FAQ.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>:!uid?<div className="rewards-empty"><p>Sign in to earn and claim account rewards.</p><small>Local practice does not unlock rewards.</small></div>:!data?<div className="rewards-empty" role="status"><p>{error||'Opening your rewards…'}</p><button className="reward-claim" onClick={()=>void refresh()}>Retry</button></div>:<>
      <div className="rewards-stage">
       <div className="rewards-track-window">
        <button className="rewards-carousel-arrow arrow-previous" aria-label="Previous rewards" disabled={!edges.left} onClick={()=>move(-1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 4-8 8 8 8"/></svg></button>
        <div className="rewards-carousel" ref={carousel} tabIndex={0} aria-label="Rewards carousel" onScroll={scheduleEdges} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={e=>finishDrag(e)} onPointerCancel={e=>finishDrag(e,true)} onLostPointerCapture={e=>finishDrag(e,true)} onClickCapture={e=>{if(Date.now()<ignoreClickUntil.current){e.preventDefault();e.stopPropagation();}}} onDragStart={e=>e.preventDefault()} onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}}}>
         {Array.from({length:Math.max(200,level+10)},(_,i)=>i+1).map(n=>{const claimed=data.claimed.includes(n),locked=n>level,m=MILESTONES.find(m=>m.level===n);return (
          <article key={n} data-reward-level={n} aria-label={`Reward ${n}${locked?', locked':claimed?', claimed':', available'}`} className={'level-reward-card '+(locked?'is-locked':claimed?'is-claimed':'is-ready')}>
           <div className="reward-card-status">{locked?<><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><span>Locked</span></>:claimed?<span>✓ Collected</span>:<span>Ready to collect</span>}</div>
           <div className="reward-prize"><RewardArt level={1}/><strong>{rewardCoins(n).toLocaleString()}</strong><span>Rung Coins</span></div>
           {m?<div className="reward-bonus"><span className="reward-bonus-plus">+</span><RewardArt level={n}/><div><small>EXTRA REWARD</small><strong>{m.name}</strong><span>{m.kind==='frame'?'Avatar frame':'Exclusive emoji'}</span></div></div>:<div className="reward-card-flourish" aria-hidden="true">♠</div>}
           <button className="reward-claim" disabled={locked||claimed||busy} onClick={e=>void act({action:'claim',level:n},e.currentTarget)}>{locked?'Locked':claimed?'Claimed':'Claim'}</button>
           <span className="reward-number" aria-label={'Level '+n}>{n}</span>
          </article>
         );})}
        </div>
        <button className="rewards-carousel-arrow arrow-next" aria-label="Next rewards" disabled={!edges.right} onClick={()=>move(1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 4 8 8-8 8"/></svg></button>
       </div>
      </div>
      <footer className="rewards-footer"><div className="rewards-footer-copy"><strong>{ready.length?`${ready.length} reward${ready.length===1?'':'s'} ready`:'You’re all caught up'}</strong><small>{ready.length?'Collect your coins and any extra rewards.':'Your next reward unlocks as you play.'}</small></div><button className="reward-claim reward-claim-all" disabled={!ready.length||busy} onClick={e=>void act({action:'claim-all'},e.currentTarget)}>{busy?'Collecting…':'Claim All'}</button><p className="rewards-feedback" role={error?'alert':'status'}>{error||message}</p></footer>
     </>}
     {flight&&<div key={flight.id} className="reward-coin-flight" aria-hidden="true" style={{left:flight.x,top:flight.y,'--reward-fly-x':flight.dx+'px','--reward-fly-y':flight.dy+'px'} as React.CSSProperties}>{Array.from({length:9},(_,i)=><img key={i} src="/art/currency/coin.svg" alt="" style={{'--coin-delay':i*28+'ms','--coin-spread':(i%3-1)*18+'px'} as React.CSSProperties}/>)}</div>}
    </section>
   </div>,document.body
  )}
 </>;

}
export function RewardCosmetics({owned=[],onChange}:{owned?:{item:string}[];onChange:()=>void}){const [busy,setBusy]=useState(false),[error,setError]=useState('');const current=equippedRewardFrame(owned);async function equip(item:string){setBusy(true);try{await socialRequest('rewards',{action:'equip',item});onChange();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}return <div className="reward-profile-cosmetics"><h3>Milestone frames</h3><div><button disabled={busy} aria-pressed={!current} onClick={()=>void equip('')}>No frame</button>{MILESTONES.filter(m=>m.kind==='frame').map(m=><button key={m.item} disabled={busy||!owned.some(o=>o.item===m.item)} aria-pressed={current===m.item.slice(6)} onClick={()=>void equip(m.item)}><RewardArt level={m.level}/>{m.name}<small>{owned.some(o=>o.item===m.item)?current===m.item.slice(6)?'Equipped':'Equip':'Claim at level '+m.level}</small></button>)}</div>{error&&<p role="alert">{error}</p>}</div>;}


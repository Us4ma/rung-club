import {CloseButton} from './art.tsx';
import {WelcomeCoinFlight} from './coin-motion.tsx';
import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {socialRequest} from './friends.tsx';
import './coin-experience.css';
const COIN_PACKAGES=[
 {name:'Pocket',coins:5000,price:280,art:'stack-250'},
 {name:'Stack',coins:15000,price:800,art:'stack-500'},
 {name:'Reserve',coins:60000,price:2800,art:'sack-reserve'},
 {name:'Vault',coins:130000,price:5600,art:'sack-vault'},
 {name:'Treasury',coins:500000,price:16000,art:'sack-treasury'},
 {name:'Million',coins:1000000,price:28000,art:'sack-million'}
] as const;
type TableCoins={requiredBalance?:number;reserveRequired?:boolean;buyIn?:number;tier?:number;stake:number;balances:number[];wallet?:number;waiting:number[];waitUntil?:number};
export function CoinExperience({uid,table,onLeave,onRefresh,tutorialStatus,motion=true,sound=true}:{tutorialStatus?:string;motion?:boolean;sound?:boolean;uid?:string;table?:{room:string;seat:number;started:boolean;coins:TableCoins|null};onLeave:()=>void;onRefresh:()=>void}){
 const waiting=!!table?.coins?.waiting.includes(table.seat);
 const requiredBalance=table?.coins?.requiredBalance??((table?.coins?.stake??200)*(table?.coins?.reserveRequired?4:1));
 const waitKey=waiting?table?.room+':'+table?.coins?.waitUntil:'';
 const [confirmLeave,setConfirmLeave]=useState(false),[submitted,setSubmitted]=useState('');
 const waitKeyRef=useRef('');
 const [gift,setGift]=useState<{x:number;y:number}|null>(null);
 const [state,setState]=useState<any>(null),[page,setPage]=useState<'welcome'|'shop'|'refill'|'buyin'|null>(null),[amount,setAmount]=useState(2500),[auto,setAuto]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[now,setNow]=useState(Date.now());const panel=useRef<HTMLElement>(null),lock=useRef(false),seen=useRef(''),version=useRef(0),topup=useRef({key:'',id:''});
 const load=async()=>{const revision=version.current;const s=await socialRequest('coins',{action:'state'});if(revision===version.current)setState(s);return s;};
 useEffect(()=>{version.current++;setGift(null);setState(null);setPage(null);seen.current='';if(!uid)return;let live=true;load().then(s=>{if(live&&s.welcomeAvailable)setPage('welcome');}).catch(()=>{});return()=>{live=false;version.current++;};},[uid,tutorialStatus]);
 useEffect(()=>{if(!uid)return;const open=()=>{setPage('shop');setError('');void load().catch(e=>setError(e.message));};window.addEventListener('rung:coin-shop',open);return()=>window.removeEventListener('rung:coin-shop',open);},[uid]);
 useEffect(()=>{
  if(!waiting||!table?.coins){setConfirmLeave(false);setSubmitted('');if(page==='refill'||page==='shop'&&waitKeyRef.current||page==='buyin'&&table?.started)setPage(null);waitKeyRef.current='';return;}
  waitKeyRef.current=waitKey;
  let active=true;
  setPage('refill');
  setNow(Date.now());
  setError('');
  void load().then(s=>{
   if(!active)return;
   const existing=s.table?.room===table.room?s.table.balance:0;
   const need=s.table?.room===table.room?Math.max(1,requiredBalance-existing):(table.coins!.buyIn||2500);
   setAmount(Math.min(s.wallet,Math.max(need,(table.coins!.buyIn||2500)-existing)));
   setPage(s.wallet<need?'shop':'refill');
  }).catch(e=>{if(active)setError(e.message);});
  return()=>{active=false;};
 },[waitKey,table?.started,requiredBalance]);
 useEffect(()=>{
  if(!waitKey)return;
  const marker='rungRefill';
  const arm=()=>{if(history.state?.[marker]!==waitKey)history.pushState({...history.state,[marker]:waitKey},'');};
  const back=()=>{arm();if(!lock.current)setConfirmLeave(true);};
  const deviceBack=(event:Event)=>{event.preventDefault();if(!lock.current)setConfirmLeave(true);};
  arm();
  window.addEventListener('popstate',back);
  window.addEventListener('rung-device-back',deviceBack);
  return()=>{
   window.removeEventListener('popstate',back);
   window.removeEventListener('rung-device-back',deviceBack);
   if(history.state?.[marker]===waitKey)history.back();
  };
 },[waitKey]);
 useEffect(()=>{if(!page)return;const timer=setInterval(()=>setNow(Date.now()),1000),previous=document.activeElement as HTMLElement|null;panel.current?.focus();return()=>{clearInterval(timer);previous?.focus();};},[page]);
 const run=async(action:string)=>{if(lock.current||!uid)return;lock.current=true;setBusy(true);setError('');try{const key=JSON.stringify([uid,table?.room,amount,auto]);if(topup.current.key!==key)topup.current={key,id:crypto.randomUUID()};const s=await socialRequest('coins',action==='welcome'?{action}:{action:'topup',id:topup.current.id,room:table?.room,amount,autoTopup:auto});topup.current={key:'',id:''};setState(s);if(action==='welcome'){const r=panel.current?.querySelector('.coins-hero')?.getBoundingClientRect();setGift(r?{x:r.left+r.width/2,y:r.top+r.height/2}:{x:innerWidth/2,y:innerHeight/2});}else{if(waiting)setSubmitted(waitKey);else setPage(null);onRefresh();}}catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}};
 if(!uid||!page)return null;
 const stack=state?.table?.room===table?.room?state?.table?.balance||0:0,wallet=state?.wallet||0,minimum=page==='buyin'||state?.table?.room!==table?.room?Math.max(1,(table?.coins?.buyIn||2500)-stack):Math.max(1,requiredBalance-stack),maximum=Math.max(0,wallet),seconds=Math.max(0,Math.ceil(((table?.coins?.waitUntil||0)-now)/1000));
 const close=()=>{if(busy||page==='welcome')return;if(waiting)setConfirmLeave(true);else setPage(null);};
 return <>{gift&&<WelcomeCoinFlight origin={gift} motion={motion} sound={sound} onDone={()=>{setGift(null);setPage(null);onRefresh();}}/>}{createPortal(<div className={'coins-layer'+(gift?' coins-claiming':'')}><button className="coins-backdrop" aria-label="Close coin options" disabled={waiting} onClick={close}/><section ref={panel} tabIndex={-1} className={'coins-panel coins-'+page} role="dialog" aria-modal="true" aria-label={page==='welcome'?'Welcome gift':page==='shop'?'Coin shop':'Table buy-in'} onKeyDown={e=>{if(e.key==='Escape'){if(confirmLeave)setConfirmLeave(false);else close();}if(e.key==='Tab'){const items=[...panel.current!.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)')];const first=items[0],last=items.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===panel.current)){e.preventDefault();first?.focus();}}}}>{page!=='welcome'&&<CloseButton className="coins-close" disabled={busy} onClick={close}/>}<span className="eyebrow">RUNG CLUB · COINS</span><h2>{page==='welcome'?'Your first seat is on us.':page==='shop'?(waiting?'Ready for another deal?':'Your coin collection'):page==='buyin'?'Take your seat.':'Refill your table balance'}</h2>{confirmLeave&&waiting?<><p>Leave this table? A bot can take your seat.</p><button className="coins-primary" onClick={()=>setConfirmLeave(false)}>Keep my seat</button><button className="coins-quiet" onClick={()=>{setConfirmLeave(false);setPage(null);onLeave();}}>Confirm leave</button></>:page==='welcome'?<><img className="coins-hero" src="/art/currency/stack-1000.svg" alt="Gold coin stack"/><strong className="coins-gift">10,000</strong><p>A welcome gift for your first games at the club.</p><button className="coins-primary" disabled={busy||!state||!!gift} onClick={()=>void run('welcome')}>{gift?'Collecting…':busy?'Claiming…':'Claim 10,000 coins'}</button></>:page==='shop'?<><p className="coins-wallet-total">Wallet <strong>{wallet.toLocaleString()} coins</strong></p>{waiting&&<p>You need coins to fund your seat for the next deal. You can leave and return when your wallet is ready.</p>}<div className="coins-ad"><span aria-hidden="true">▷</span><div><strong>Watch & Earn · 2,500 coins</strong><small>Rewarded ads are not available yet.</small></div><button disabled>Unavailable</button></div><div className="coin-packages">{COIN_PACKAGES.map(pack=><article key={pack.name}><span className="coin-package-name">{pack.name}</span><img src={'/art/currency/'+pack.art+'.svg'} alt=""/><strong>{pack.coins.toLocaleString('en-PK')}</strong><span>Coins</span><span className="coin-package-price">PKR {pack.price.toLocaleString('en-PK')}</span><button disabled aria-label={pack.name+' coin package — purchases coming soon'}>Coming soon</button></article>)}</div><small className="coins-muted">Coin purchases will appear here when the store opens.</small>{waiting&&<button className="coins-primary" onClick={waiting?close:()=>{setPage(null);onLeave();}}>Leave table</button>}</>:<><p className="coins-wallet-total">Wallet <strong>{wallet.toLocaleString()}</strong><span>At table <strong>{stack.toLocaleString()}</strong></span></p><p><strong>{table?.coins?.stake||200} coins per deal.</strong> The Rung caller and partner each need four times the selected stake available to cover a Goon Kot. Unused reserves are released after settlement.</p>{waiting&&state&&<p>You need <strong>{(state.table?.room===table?.room?requiredBalance:Math.max(requiredBalance,table?.coins?.buyIn??2500)).toLocaleString()} coins at this table</strong> to continue. Minimum refill: <strong>{minimum.toLocaleString()} coins</strong>.</p>}<label className="coins-amount">Add to table <output>{Math.max(minimum,Math.min(amount,Math.max(minimum,maximum))).toLocaleString()} coins</output><input aria-label="Coins to add" type="range" min={minimum} max={Math.max(minimum,maximum)} step="1" value={Math.max(minimum,Math.min(amount,Math.max(minimum,maximum)))} disabled={busy||maximum<minimum} onChange={e=>setAmount(Number(e.target.value))}/></label><div className="coins-presets"><button disabled={busy||maximum<minimum} onClick={()=>setAmount(Math.min(maximum,Math.max(minimum,(table?.coins?.buyIn||2500)-stack)))}>{(table?.coins?.buyIn||2500).toLocaleString()} total</button><button disabled={busy||maximum<minimum} onClick={()=>setAmount(maximum)}>Max {maximum.toLocaleString()}</button></div><label className="coins-auto"><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/>Auto top-up to {(table?.coins?.buyIn||2500).toLocaleString()} between deals when my wallet can cover it</label><button className="coins-primary" disabled={busy||waiting&&submitted===waitKey||amount<minimum||amount>maximum} onClick={()=>void run('topup')}>{waiting&&submitted===waitKey?'Waiting for table…':busy?'Adding coins…':'Add '+amount.toLocaleString()+' coins'}</button>{maximum<minimum&&<button onClick={()=>setPage('shop')}>Get more coins</button>}<button className="coins-quiet" disabled={busy} onClick={waiting?close:()=>{setPage(null);onLeave();}}>Leave table</button></>}{waiting&&<small className="coins-timer">Seat held for {seconds}s. Other players stay at this table.</small>}{error&&<p className="coins-error" role="alert">{error}</p>}</section></div>,document.body)}</>;
}

export function TableRefillStatus({room,coins,seat,bots,serverOffset}:{room:string;coins:TableCoins|null;seat:number;bots:boolean[];serverOffset:number}){
 const waiting=coins?.waiting??[];
 const previous=useRef<{room:string;waiting:number[]}>({room,waiting:[]});
 const [replacement,setReplacement]=useState(false),[now,setNow]=useState(Date.now());
 const waitingKey=waiting.join(','),botKey=bots.join(',');
 useEffect(()=>{
  const old=previous.current;
  previous.current={room,waiting};
  if(old.room!==room){setReplacement(false);return;}
  if(old.waiting.some(player=>player!==seat&&!waiting.includes(player)&&bots[player]))setReplacement(true);
 },[room,waitingKey,botKey,seat]);
 useEffect(()=>{
  if(!replacement)return;
  const timer=setTimeout(()=>setReplacement(false),4000);
  return()=>clearTimeout(timer);
 },[replacement,room]);
 useEffect(()=>{
  if(!coins?.waitUntil)return;
  const update=()=>setNow(Date.now());
  update();
  const timer=setInterval(update,250);
  return()=>clearInterval(timer);
 },[coins?.waitUntil]);
 if(!waiting.length&&!replacement)return null;
 const seconds=Math.max(0,Math.ceil(((coins?.waitUntil??0)-now-serverOffset)/1000));
 const message=waiting.includes(seat)?'Add coins to continue':waiting.length
  ?'Waiting for '+(waiting.includes((seat+2)%4)?'your partner':'a player')+' to refill'+(coins?.waitUntil?' · '+seconds+'s':'')
  :'A bot has taken the seat';
 return <div className="table-coin-status" role="status"><strong>{message}</strong></div>;
}

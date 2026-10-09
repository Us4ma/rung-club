export {};
// This entry has no React, Firebase or Phaser dependency. The HTML paints first.
const screen=document.getElementById('boot-screen');
const root=document.getElementById('root');
const message=document.getElementById('boot-message');
const retry=document.getElementById('boot-retry');
retry?.addEventListener('click',()=>location.reload());
let ready=false;
const slow=setTimeout(()=>{if(!ready){if(message)message.textContent='Still connecting… check your connection.';retry?.removeAttribute('hidden');}},8000);
function finish(){if(ready)return;ready=true;clearTimeout(slow);root?.removeAttribute('inert');root?.removeAttribute('aria-hidden');screen?.classList.add('boot-complete');const remove=()=>screen?.remove();if(matchMedia('(prefers-reduced-motion: reduce)').matches)remove();else{screen?.addEventListener('transitionend',remove,{once:true});setTimeout(remove,250);}}
window.addEventListener('rung:ready',finish,{once:true});
import('./main.tsx').catch(()=>{clearTimeout(slow);if(message)message.textContent='Couldn’t load the club. Check your connection and try again.';screen?.classList.add('boot-error');retry?.removeAttribute('hidden');});

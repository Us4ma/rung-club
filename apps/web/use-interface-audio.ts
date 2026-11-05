import {useEffect,useRef} from 'react';
import {tableAudio} from './table-audio.ts';

type Cue='tap'|'open'|'back'|'confirm';
/** One delegated listener covers drawers/portals as well as lobby navigation.
 * Card interactions and the table's existing confirmed-event sounds stay separate.
 */
export function useInterfaceAudio(enabled:boolean){
 const current=useRef(enabled);current.current=enabled;
 useEffect(()=>{
  let last=0;
  const feedback=(cue:Cue,allowed=current.current)=>{
   const now=Date.now();if(!allowed||now-last<90||document.hidden)return;
   last=now;tableAudio.uiEffect(cue,true);
  };
  const click=(event:MouseEvent)=>{
   const target=event.target instanceof Element?event.target:null;
   if(target?.closest('input,select,textarea'))return;
   const control=target?.closest<HTMLElement>('button,a[href],[role="button"],[role="tab"],[role="switch"]');
   if(!control||control.closest('[inert],[data-ui-sound="off"]')||control.matches(':disabled,[aria-disabled="true"]'))return;
   // Settings/friends in the table toolbar are UI; card/turn controls already have SFX.
   if(control.closest('.table-page')&&!control.closest('.table-top,.table-tools'))return;
   if(control.getAttribute('aria-selected')==='true'||control.getAttribute('aria-pressed')==='true')return;
   const label=(control.getAttribute('aria-label')||control.getAttribute('title')||control.textContent||'').trim();
   const back=control.matches('.back-button,[class*="backdrop"]')||/^(back|close|cancel|decline|lobby|not now)\b/i.test(label);
   const confirm=control.matches('[type="submit"]')||/^(save|confirm|accept|join|play|create|continue|select a table|buy|invite)\b/i.test(label);
   const open=control.matches('.icon-button,.profile-link,.mode-tile,[role="tab"],[aria-haspopup]')||/^(settings|friends|standings|club standings|profile|customization|stats|rewards|private room|sound)\b/i.test(label);
   feedback(back?'back':confirm?'confirm':open?'open':'tap');
  };
  const change=(event:Event)=>{
   const input=event.target;
   if(!(input instanceof HTMLInputElement)||!['checkbox','radio'].includes(input.type)||input.disabled)return;
   if(input.closest('.table-page'))return;
   // Turning effects off is silent; allow feedback when enabling them.
   const soundSwitch=input.getAttribute('aria-label')==='Sound effects';
   feedback('tap',soundSwitch?input.checked:current.current);
  };
  document.addEventListener('click',click,true);document.addEventListener('change',change,true);
  return()=>{document.removeEventListener('click',click,true);document.removeEventListener('change',change,true);};
 },[]);
}

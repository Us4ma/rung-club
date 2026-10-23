import {TABLE_AUDIO_CLIPS} from './table-audio-clips.ts';
/** Kenney CC0 recordings share one preloaded, non-overlapping output lane. */
export type TableCue='shuffle'|'deal'|'place'|'cut'|'gather'|'collect'|'reveal'|'win'|'lose'|'kot'|'turn'|'tick'|'coinStake'|'coinCount'|'coinPay'|'coinGift';
type UICue='tap'|'open'|'back'|'confirm';
const UI_CLIPS={tap:[0,.083243],open:[.183243,.346757],back:[.63,.346757],confirm:[1.076757,.050658]} as const;
type Job={cue:TableCue;until:number;epoch:number;gain?:number;ui?:UICue};
export class TableAudio {
 private context:AudioContext|null=null;
 private buffer:AudioBuffer|null=null;
 private uiBuffer:AudioBuffer|null=null;
 private uiBytes:Promise<ArrayBuffer>|null=null;
 private uiLoading:Promise<void>|null=null;
 private bytes:Promise<ArrayBuffer>|null=null;
 private loading:Promise<void>|null=null;
 private enabled=false;
 private active=false;
 private interfaceEnabled=false;
 private foreground=true;
 private epoch=0;
 private variation=0;
 private queue:Job[]=[];
 private playing=false;
 private source:AudioBufferSourceNode|null=null;
 configure(active:boolean,enabled:boolean){this.active=active;this.enabled=enabled;this.preload();if(!active||!enabled)this.clear();}
 private preload(){
  if(!this.uiBytes&&!this.uiBuffer){
   this.uiBytes=fetch('/audio/interface-v2/ui.mp3').then(r=>{if(!r.ok)throw Error('UI audio unavailable');return r.arrayBuffer();}).catch(error=>{this.uiBytes=null;throw error;});
   void this.uiBytes.catch(()=>{});
  }
  if(this.bytes||this.buffer)return;
  this.bytes=fetch('/audio/table-v3/table.mp3').then(r=>{if(!r.ok)throw Error('Table audio unavailable');return r.arrayBuffer();}).catch(error=>{this.bytes=null;throw error;});
  // Missing audio must not block gameplay; retry on a later interaction.
  void this.bytes.catch(()=>{});
 }
 private load(){
  if(this.context&&!this.uiBuffer&&!this.uiLoading){
   this.preload();const context=this.context;
   this.uiLoading=this.uiBytes!.then(bytes=>context.decodeAudioData(bytes.slice(0))).then(buffer=>{this.uiBuffer=buffer;this.next();}).catch(()=>{}).finally(()=>{this.uiLoading=null;});
  }
  if(this.buffer||this.loading||!this.context)return;
  this.preload();const context=this.context;
  this.loading=this.bytes!.then(bytes=>context.decodeAudioData(bytes.slice(0))).then(buffer=>{this.buffer=buffer;this.next();}).catch(()=>{}).finally(()=>{this.loading=null;});
 }
 setForeground(value:boolean){this.foreground=value;if(!value)this.clear();}
 unlock(){if(!this.enabled)return;try{this.context??=new AudioContext();void this.context.resume().then(()=>this.next()).catch(()=>{});this.load();}catch{/* Unsupported device: silent fallback. */}}
 private allowed(){return (this.active||this.interfaceEnabled)&&this.enabled&&this.foreground;}
 clear(){this.interfaceEnabled=false;this.epoch++;this.queue=[];this.playing=false;this.source?.stop();this.source=null;}
 interfaceEffect(cue:TableCue,enabled:boolean){if(!enabled||document.hidden)return;this.interfaceEnabled=true;this.enabled=true;this.enqueue({cue,until:Date.now()+1000,epoch:this.epoch});}
 /** Dedicated, softened Kenney UI recordings share the table's single output lane. */
 uiEffect(cue:UICue,enabled:boolean){
  if(!enabled||document.hidden||this.playing||this.queue.length)return;
  this.interfaceEnabled=true;this.enabled=true;
  this.enqueue({cue:'tick',ui:cue,until:Date.now()+300,epoch:this.epoch,gain:.8});
 }
 effect(cue:TableCue,ttl=450){if(!this.active)return;if(cue==='tick'&&(this.playing||this.queue.length))return;this.enqueue({cue,until:Date.now()+ttl,epoch:this.epoch});}
 private enqueue(job:Job){if(!this.allowed())return;this.unlock();if(this.queue.length>=8)return;this.queue.push(job);this.next();}
 private next(){
  if(this.playing||!this.allowed()||!this.context||this.context.state!=='running')return;
  while(this.queue.length&&(this.queue[0].until<Date.now()||this.queue[0].epoch!==this.epoch))this.queue.shift();
  const pending=this.queue[0];if(!pending)return;
  const buffer=pending.ui?this.uiBuffer:this.buffer;if(!buffer)return;
  const job=this.queue.shift()!;
  const epoch=this.epoch;this.playing=true;let done=false;
  const finish=()=>{if(done||epoch!==this.epoch)return;done=true;this.source=null;this.playing=false;if(!this.queue.length)this.interfaceEnabled=false;this.next();};
  try{
   const clip=job.ui?UI_CLIPS[job.ui]:job.cue==='place'&&this.variation++%2?TABLE_AUDIO_CLIPS.placeAlt:TABLE_AUDIO_CLIPS[job.cue];
   const source=this.context.createBufferSource();source.buffer=buffer;
   if(job.gain!==undefined){const gain=this.context.createGain();gain.gain.value=job.gain;source.connect(gain);gain.connect(this.context.destination);source.onended=()=>{source.disconnect();gain.disconnect();finish();};}else{source.connect(this.context.destination);source.onended=()=>{source.disconnect();finish();};}
   this.source=source;
   source.start(0,clip[0],clip[1]);
  }catch{finish();}
 }
}
export const tableAudio=new TableAudio();

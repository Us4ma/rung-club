import {TABLE_AUDIO_CLIPS} from './table-audio-clips.ts';
/** Kenney CC0 recordings share one preloaded, non-overlapping output lane. */
export type TableCue='shuffle'|'deal'|'place'|'cut'|'gather'|'collect'|'reveal'|'win'|'lose'|'kot'|'turn'|'tick';
type Job={cue:TableCue;until:number;epoch:number};
export class TableAudio {
 private context:AudioContext|null=null;
 private buffer:AudioBuffer|null=null;
 private bytes:Promise<ArrayBuffer>|null=null;
 private loading:Promise<void>|null=null;
 private enabled=false;
 private active=false;
 private foreground=true;
 private epoch=0;
 private variation=0;
 private queue:Job[]=[];
 private playing=false;
 private source:AudioBufferSourceNode|null=null;
 configure(active:boolean,enabled:boolean){this.active=active;this.enabled=enabled;this.preload();if(!active||!enabled)this.clear();}
 private preload(){
  if(this.bytes||this.buffer)return;
  this.bytes=fetch('/audio/table-v2/table.mp3').then(r=>{if(!r.ok)throw Error('Table audio unavailable');return r.arrayBuffer();}).catch(error=>{this.bytes=null;throw error;});
  // Missing audio must not block gameplay; retry on a later interaction.
  void this.bytes.catch(()=>{});
 }
 private load(){
  if(this.buffer||this.loading||!this.context)return;
  this.preload();const context=this.context;
  this.loading=this.bytes!.then(bytes=>context.decodeAudioData(bytes.slice(0))).then(buffer=>{this.buffer=buffer;this.next();}).catch(()=>{}).finally(()=>{this.loading=null;});
 }
 setForeground(value:boolean){this.foreground=value;if(!value)this.clear();}
 unlock(){if(!this.enabled)return;try{this.context??=new AudioContext();void this.context.resume().then(()=>this.next()).catch(()=>{});this.load();}catch{/* Unsupported device: silent fallback. */}}
 private allowed(){return this.active&&this.enabled&&this.foreground;}
 clear(){this.epoch++;this.queue=[];this.playing=false;this.source?.stop();this.source=null;}
 effect(cue:TableCue,ttl=450){if(cue==='tick'&&(this.playing||this.queue.length))return;this.enqueue({cue,until:Date.now()+ttl,epoch:this.epoch});}
 private enqueue(job:Job){if(!this.allowed())return;this.unlock();if(this.queue.length>=8)return;this.queue.push(job);this.next();}
 private next(){
  if(this.playing||!this.allowed()||!this.context||this.context.state!=='running'||!this.buffer)return;
  let job:Job|undefined;while((job=this.queue.shift())&&(job.until<Date.now()||job.epoch!==this.epoch)){}if(!job)return;
  const epoch=this.epoch;this.playing=true;let done=false;
  const finish=()=>{if(done||epoch!==this.epoch)return;done=true;this.source=null;this.playing=false;this.next();};
  try{
   const clip=job.cue==='place'&&this.variation++%2?TABLE_AUDIO_CLIPS.placeAlt:TABLE_AUDIO_CLIPS[job.cue];
   const source=this.context.createBufferSource();source.buffer=this.buffer;source.connect(this.context.destination);this.source=source;
   source.onended=()=>{source.disconnect();finish();};source.start(0,clip[0],clip[1]);
  }catch{finish();}
 }
}
export const tableAudio=new TableAudio();

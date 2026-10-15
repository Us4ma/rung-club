/** Table foley shares ONE output lane. No network or paid audio service. */
export type TableCue='shuffle'|'deal'|'place'|'cut'|'gather'|'collect'|'reveal'|'win'|'lose'|'kot'|'turn'|'tick';
type Job={cue:TableCue;until:number;epoch:number};
export class TableAudio {
 private context:AudioContext|null=null;
 private enabled=false;
 private active=false;
 private foreground=true;
 private epoch=0;
 private queue:Job[]=[];
 private playing=false;
 private source:AudioBufferSourceNode|null=null;
 configure(active:boolean,enabled:boolean){this.active=active;this.enabled=enabled;if(!active||!enabled)this.clear();}
 setForeground(value:boolean){this.foreground=value;if(!value)this.clear();}
 unlock(){if(!this.enabled)return;try{this.context??=new AudioContext();void this.context.resume().then(()=>this.next()).catch(()=>{});}catch{/* Unsupported device: silent fallback. */}}
 private allowed(){return this.active&&this.enabled&&this.foreground;}
 clear(){this.epoch++;this.queue=[];this.playing=false;this.source?.stop();this.source=null;}
 effect(cue:TableCue,ttl=450){if(cue==='tick'&&(this.playing||this.queue.length))return;this.enqueue({cue,until:Date.now()+ttl,epoch:this.epoch});}
 private enqueue(job:Job){if(!this.allowed())return;this.unlock();if(this.queue.length>=8)return;this.queue.push(job);this.next();}
 private next(){if(this.playing||!this.allowed()||!this.context||this.context.state!=='running')return;let job:Job|undefined;while((job=this.queue.shift())&&(job.until<Date.now()||job.epoch!==this.epoch)){}if(!job)return;
  const epoch=this.epoch;this.playing=true;let done=false;
  const finish=()=>{if(done||epoch!==this.epoch)return;done=true;this.source=null;this.playing=false;this.next();};
  const context=this.context;if(!context||context.state!=='running'){finish();return;}
  try{const buffer=this.foley(context,job.cue);const source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);this.source=source;source.onended=()=>{source.disconnect();finish();};source.start();}catch{finish();}
 }
 private foley(context:AudioContext,cue:TableCue){
  const duration=({shuffle:.32,deal:.12,place:.07,cut:.13,gather:.26,collect:.32,reveal:.25,win:.65,lose:.4,kot:.85,turn:.1,tick:.045})[cue];
  const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);
  let previous=0;
  for(let i=0;i<data.length;i++){const t=i/context.sampleRate,x=t/duration,noise=Math.random()*2-1;previous=.6*previous+.4*noise;
   const envelope=Math.sin(Math.PI*x)**2;let sample=0;
   if(cue==='shuffle'||cue==='deal'){const pulse=(t%(cue==='shuffle'?.035:.045))/.012;sample=(noise-previous)*Math.exp(-pulse)*.27*envelope;}
   else if(cue==='place'||cue==='cut'){const attack=Math.min(1,t/.002);sample=(noise*.24+previous*.3+Math.sin(2*Math.PI*(cue==='cut'?180:125)*t)*(cue==='cut'?.23:.17))*Math.exp(-t*42)*attack;}
   else if(cue==='tick'){sample=(Math.sin(2*Math.PI*1600*t)*.12+previous*.08)*Math.exp(-t*130)*Math.min(1,t/.001);}
   else if(cue==='gather'||cue==='collect'){sample=previous*.19*envelope*(.65+.35*Math.sin(t*180));if(cue==='collect')sample+=Math.sin(2*Math.PI*110*t)*.08*Math.exp(-Math.max(0,t-.22)*80)*(t>.22?1:0);}
   else {const notes=cue==='lose'?[330,294]:cue==='turn'?[660]:cue==='reveal'?[523,784]:cue==='kot'?[523,659,784,1047]:[523,659,784];const n=Math.min(notes.length-1,Math.floor(x*notes.length));sample=Math.sin(2*Math.PI*notes[n]*t)*.07*envelope;}
   data[i]=sample;
  }return buffer;
 }
}
export const tableAudio=new TableAudio();

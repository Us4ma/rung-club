// Let CSS animations use the display refresh rate; only trim visual cost on slower devices.
export function installMotionQuality(){
 const root=document.documentElement;
 const nav=navigator as Navigator&{deviceMemory?:number;connection?:{saveData?:boolean}};
 const constrained=!!nav.connection?.saveData||(nav.deviceMemory!==undefined&&nav.deviceMemory<=2)||(nav.hardwareConcurrency>0&&nav.hardwareConcurrency<=2);
 root.dataset.effects=constrained?'lite':'full';
 let frame=0,timer:ReturnType<typeof setTimeout>|undefined,previous=0,samples:number[]=[],slowWindows=0;
 function sample(now:number){
  if(document.hidden)return;
  if(previous)samples.push(now-previous);previous=now;
  if(samples.length<120){frame=requestAnimationFrame(sample);return;}
  const sorted=[...samples].sort((a,b)=>a-b),baseline=sorted[Math.floor(sorted.length*.2)];
  const missed=samples.filter(ms=>ms>Math.max(22,baseline*1.8)).length/samples.length;
  // Sustained sub-50fps or repeated missed frames, not a single network/decode pause.
  slowWindows=(baseline>22||missed>.18)?slowWindows+1:0;
  if(slowWindows>=2)root.dataset.effects='lite';
  previous=0;samples=[];timer=setTimeout(start,15000);
 }
 function start(){if(!document.hidden&&!constrained){previous=0;samples=[];frame=requestAnimationFrame(sample);}}
 function visibility(){cancelAnimationFrame(frame);clearTimeout(timer);previous=0;samples=[];if(!document.hidden)timer=setTimeout(start,1500);}
 document.addEventListener('visibilitychange',visibility);timer=setTimeout(start,1500);
 return()=>{cancelAnimationFrame(frame);clearTimeout(timer);document.removeEventListener('visibilitychange',visibility);};
}

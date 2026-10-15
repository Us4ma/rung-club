/** One lobby-only loop. No eager download on the authentication screen. */
export class LobbyMusic {
 private track:HTMLAudioElement|null=null;
 private enabled=false;
 private foreground=true;
 private volume=.35;
 constructor(private create:()=>HTMLAudioElement=()=>new Audio('/audio/lobby-midnight.mp3')){}
 configure(enabled:boolean,volume:number){this.enabled=enabled;this.volume=Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):.35;this.sync();}
 setForeground(active:boolean){this.foreground=active;this.sync();}
 resume(){this.sync();}
 private sync(){
  if(!this.enabled||!this.foreground){this.track?.pause();return;}
  if(!this.track){this.track=this.create();this.track.loop=true;this.track.preload='none';}
  this.track.volume=this.volume;
  if(this.track.paused)this.track.play().then(()=>{if(!this.enabled||!this.foreground)this.track?.pause();}).catch(()=>{/* Retry after the next user gesture; never block navigation. */});
 }
 dispose(){this.enabled=false;this.track?.pause();this.track?.removeAttribute('src');this.track?.load();this.track=null;}
}

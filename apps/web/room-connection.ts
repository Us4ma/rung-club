/** Keep authoritative tables usable when a network refuses WebSocket upgrades. */
export class RoomConnection {
 readyState=0;
 onopen:(()=>void)|null=null;
 onmessage:((event:{data:string})=>void)|null=null;
 onclose:(()=>void)|null=null;
 private socket:WebSocket|null=null;
 private closed=false;
 private fallback=false;
 private timer:ReturnType<typeof setTimeout>|undefined;
 private handshake:ReturnType<typeof setTimeout>|undefined;
 private failures=0;
 private events=new Set<string>();
 private queue=Promise.resolve();
 private lastState:{match:string,revision:number,seq:number}|undefined;
 private retired=new Set<string>();
 constructor(url:string,private request:(path:string,body:unknown)=>Promise<any>,private code:string){
  try{
   const socket=this.socket=new WebSocket(url);
   this.handshake=setTimeout(()=>this.useHTTP(),4000);
   socket.onopen=()=>{if(!this.fallback&&!this.closed){this.readyState=1;this.onopen?.();}};
   socket.onmessage=event=>{if(this.fallback||this.closed)return;clearTimeout(this.handshake);this.emit(JSON.parse(event.data));};
   socket.onclose=()=>{if(!this.closed)this.useHTTP();};
   socket.onerror=()=>{if(!this.closed)this.useHTTP();};
  }catch{queueMicrotask(()=>this.useHTTP());}
 }
 private emit(message:any){
  if(this.closed)return;
  if(message.type==='state'){const match=message.view.matchId,previous=this.lastState;if(this.retired.has(match)||previous&&previous.match===match&&(message.view.revision<previous.revision||message.seq<previous.seq))return;if(previous&&previous.match!==match)this.retired.add(previous.match);this.lastState={match,revision:message.view.revision,seq:message.seq};}
  if(message.type==='emote'&&message.at&&Date.now()-message.at>5000)return;
  if(message.type==='emote'&&message.id){if(this.events.has(message.id))return;this.events.add(message.id);if(this.events.size>40)this.events.delete(this.events.values().next().value!);}
  this.onmessage?.({data:JSON.stringify(message)});
  if(message.type==='state')for(const event of message.events||[])this.emit(event);
 }
 private useHTTP(){
  if(this.closed||this.fallback)return;this.fallback=true;clearTimeout(this.handshake);
  const socket=this.socket;this.socket=null;if(socket){socket.onclose=null;socket.onerror=null;socket.close();}
  this.readyState=0;void this.poll();
 }
 private receive(result:any){
  if(this.closed)return;
  if(this.readyState!==1){this.readyState=1;this.onopen?.();}
  this.failures=0;
  for(const message of result.messages||[])this.emit(message);
  if(result.state)this.emit(result.state);
 }
 private async poll(){
  if(this.closed)return;
  try{this.receive(await this.request('table-state',{code:this.code}));}
  catch(error){if(this.closed)return;if(++this.failures>=4){this.emit({type:'error',message:error instanceof Error?error.message:'Unable to reach the table.'});this.close();this.onclose?.();return;}}
  if(!this.closed)this.timer=setTimeout(()=>void this.poll(),1500);
 }
 send(raw:string){
  if(this.closed||this.readyState!==1)throw Error('Reconnecting; please wait');
  if(!this.fallback&&this.socket?.readyState===1){this.socket.send(raw);return;}
  this.queue=this.queue.then(async()=>{try{this.receive(await this.request('table-command',{code:this.code,command:JSON.parse(raw)}));}catch(error){this.emit({type:'error',message:error instanceof Error?error.message:'The move could not be sent. Please retry.'});}});
 }
 close(){this.closed=true;this.readyState=3;clearTimeout(this.timer);clearTimeout(this.handshake);if(this.socket){this.socket.onclose=null;this.socket.onerror=null;this.socket.close();this.socket=null;}}
}

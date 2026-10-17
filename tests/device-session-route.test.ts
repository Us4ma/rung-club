import {it,expect,vi} from 'vitest';
vi.mock('cloudflare:workers',()=>({DurableObject:class{ctx:any;env:any;constructor(ctx:any,env:any){this.ctx=ctx;this.env=env;}}}));
vi.mock('jose',()=>({createRemoteJWKSet:()=>({}),jwtVerify:async()=>({payload:{sub:'member',auth_time:Math.floor(Date.now()/1000),firebase:{sign_in_provider:'google.com'}}})}));
import worker,{CardRoom} from '../apps/server/worker.ts';
it('validates installation ownership before table access and allows sign-out transfer',async()=>{
 const rooms=new Map<string,CardRoom>();const env:any={FIREBASE_PROJECT_ID:'test',ALLOWED_ORIGIN:'https://rung-club.vercel.app',DB:{prepare:()=>({bind:()=>({first:async()=>({uid:'member',name:'Usama',deleted:0,revoked_before:0})})})}};
 env.ROOMS={idFromName:(name:string)=>name,get:(name:string)=>{if(!rooms.has(name)){const data=new Map();const ctx:any={blockConcurrencyWhile:(f:any)=>f(),getWebSockets:()=>[],storage:{get:async(k:string)=>data.get(k),put:async(k:string,v:any)=>data.set(k,v),delete:async(k:string)=>data.delete(k)}};rooms.set(name,new CardRoom(ctx,env));}return {fetch:(r:Request)=>rooms.get(name)!.fetch(r)};}};
 const request=(device:string,path='device-session',body:any={action:'heartbeat'})=>worker.fetch(new Request('https://rung-club.vercel.app/api/'+path,{method:'POST',headers:{Origin:'https://rung-club.vercel.app',Authorization:'Bearer verified','X-Device-ID':device,'Content-Type':'application/json'},body:JSON.stringify(body)}),env);
 expect((await request('installation-device-A')).status).toBe(200);
 const conflict=await request('installation-device-B');expect(conflict.status).toBe(409);expect((await conflict.json() as any).code).toBe('SESSION_ACTIVE');
 expect((await request('installation-device-B','rooms',{mode:'open'})).status).toBe(409);
 expect((await request('installation-device-B','device-session',{action:'takeover'})).status).toBe(200);expect((await request('installation-device-A')).status).toBe(409);expect((await request('installation-device-A','device-session',{action:'release'})).status).toBe(409);expect((await request('installation-device-B','device-session',{action:'release'})).status).toBe(200);
 expect((await request('installation-device-B')).status).toBe(200);
 expect((await request('installation-device-A','socket-ticket',{code:'ABCD1234'})).status).toBe(409);
});

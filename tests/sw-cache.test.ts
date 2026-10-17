import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
it('retires old game caches, bypasses HTML cache, and never serves HTML for a missing script',async()=>{
 const events:Record<string,any>={},deleted:string[]=[],seen:Request[]=[];let offline=false;
 const cache={put:async()=>{},match:async(key:any)=>key==='/'?new Response('<html>current</html>'):undefined};
 runInNewContext(readFileSync('apps/web/public/sw.js','utf8'),{self:{addEventListener:(name:string,f:any)=>events[name]=f,skipWaiting:()=>{},clients:{claim:async()=>{}}},location:{origin:'https://rung.test'},URL,Request,Response,caches:{keys:async()=>['rung-v1','rung-v2','unrelated'],delete:async(k:string)=>deleted.push(k),open:async()=>cache},fetch:async(r:Request)=>{seen.push(r);if(offline)throw Error('offline');return new Response('current');}});
 let pending!:Promise<any>;events.activate({waitUntil:(p:Promise<any>)=>pending=p});await pending;expect(deleted).toEqual(['rung-v1']);
 const navigation=new Request('https://rung.test/');Object.defineProperty(navigation,'mode',{value:'navigate'});
 events.fetch({request:navigation,respondWith:(p:Promise<any>)=>pending=p});await pending;expect(seen[0].cache).toBe('no-store');
 offline=true;events.fetch({request:new Request('https://rung.test/assets/old.js'),respondWith:(p:Promise<any>)=>pending=p});expect((await pending).type).toBe('error');
 let intercepted=false;events.fetch({request:new Request('https://rung.test/api/identity'),respondWith:()=>intercepted=true});expect(intercepted).toBe(false);
});

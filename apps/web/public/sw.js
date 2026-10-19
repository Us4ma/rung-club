const CACHE='rung-v3';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('rung-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==location.origin||url.pathname.startsWith('/api')||url.pathname.startsWith('/socket')||url.pathname.startsWith('/__/auth'))return;
 // Let the browser handle media byte ranges; Cache.put rejects 206 responses.
 if(request.headers.has('range')||request.destination==='audio'||url.pathname.startsWith('/audio/'))return;
 const navigation=request.mode==='navigate';
 event.respondWith((async()=>{
  try{
   // Revalidate the entry document rather than accepting the browser's old HTML.
   const response=await fetch(navigation?new Request(request,{cache:'no-store'}):request);
   if(response.ok&&response.status===200){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}
   return response;
  }catch{
   const cache=await caches.open(CACHE),saved=await cache.match(request);
   if(saved)return saved;
   // A missing JS chunk must never receive an HTML page as its fallback.
   if(navigation){const home=await cache.match('/');if(home)return home;}
   return Response.error();
  }
 })());
});

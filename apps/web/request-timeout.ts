/** Portable timeout support, including Safari versions without AbortSignal.timeout. */
export async function withRequestTimeout<T>(request:(signal:AbortSignal)=>Promise<T>,milliseconds=30000):Promise<T>{
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),milliseconds);
 try{return await request(controller.signal);}finally{clearTimeout(timer);}
}

// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
const source=readFileSync('apps/web/bootstrap.ts','utf8')
 .replace('export {};','')
 .replace('new Promise<void>','new Promise')
 .replace("import('./main.tsx')",'loadMain()');
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();document.body.innerHTML='';});
function boot(loadMain:()=>Promise<void>){
 document.body.innerHTML='<section id="boot-screen"><p id="boot-message"></p><button id="boot-retry" hidden></button></section><div id="root" inert aria-hidden="true"></div>';
 vi.stubGlobal('matchMedia',()=>({matches:true}));
 const decoded:string[]=[];
 vi.stubGlobal('Image',class {src='';decode(){decoded.push(this.src);return Promise.resolve();}});
 new Function('loadMain',source)(loadMain);
 return decoded;
}
it('preloads card faces and keeps the app covered for two seconds even when ready immediately',async()=>{
 vi.useFakeTimers();
 const decoded=boot(()=>Promise.resolve());
 expect(decoded.filter(path=>path.includes('/house/cards/'))).toHaveLength(52);
 window.dispatchEvent(new Event('rung:ready'));
 await vi.advanceTimersByTimeAsync(1999);
 expect(document.getElementById('root')!.hasAttribute('inert')).toBe(true);
 await vi.advanceTimersByTimeAsync(1);
 expect(document.getElementById('boot-screen')).toBeNull();
 expect(document.getElementById('root')!.hasAttribute('inert')).toBe(false);
});
it('waits for application readiness on slow startup',async()=>{
 vi.useFakeTimers();boot(()=>Promise.resolve());
 await vi.advanceTimersByTimeAsync(3000);
 expect(document.getElementById('boot-screen')).not.toBeNull();
 window.dispatchEvent(new Event('rung:ready'));
 await vi.advanceTimersByTimeAsync(0);
 expect(document.getElementById('boot-screen')).toBeNull();
});
it('keeps the error and retry visible if the entry fails during the minimum delay',async()=>{
 vi.useFakeTimers();boot(()=>Promise.reject(new Error('Offline')));
 window.dispatchEvent(new Event('rung:ready'));
 await vi.advanceTimersByTimeAsync(2000);
 expect(document.getElementById('boot-screen')!.classList.contains('boot-error')).toBe(true);
 expect(document.getElementById('boot-retry')!.hasAttribute('hidden')).toBe(false);
});

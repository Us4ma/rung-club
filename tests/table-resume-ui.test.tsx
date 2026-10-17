// @vitest-environment jsdom
import React from 'react';import {it,expect,vi,afterEach} from 'vitest';import {render,waitFor,cleanup} from '@testing-library/react';
const observed=vi.hoisted(()=>({urls:[] as string[],profileCalls:0}));
vi.mock('../apps/web/auth.ts',()=>({configured:true,completeRedirectLogin:async()=>null,restoredIdentity:async()=>({uid:'member',isAnonymous:false,getIdToken:async()=>'verified'}),logout:async()=>{},authMessage:(e:Error)=>e.message,secureSession:async()=>({token:'verified'}),protectAccount:async()=>{},removeIdentity:async()=>{},guestLogin:async()=>({local:false}),emailLogin:async()=>{},socialLogin:async()=>{},resetPassword:async()=>{}}));
vi.mock('../apps/web/username.tsx',()=>({UsernameForm:()=>null,accountProfile:async()=>{if(observed.profileCalls++===0)throw Object.assign(Error('Other device active'),{code:'SESSION_ACTIVE'});return {user:{uid:'member',name:'Usama'},totals:{xp:0},stats:{matches:0,wins:0},history:[]};}}));
vi.mock('../apps/web/table.ts',()=>({mountTable:()=>({destroy:()=>{}})}));
vi.mock('../apps/web/room-connection.ts',()=>({RoomConnection:class{readyState=0;onmessage:any;onopen:any;onclose:any;constructor(url:string){observed.urls.push(url);}send(){}close(){}}}));
import {App} from '../apps/web/main.tsx';
afterEach(()=>{cleanup();vi.unstubAllGlobals();localStorage.clear();sessionStorage.clear();});
it('sign-in takes over the existing table directly without opening the lobby or joining a new room',async()=>{
 localStorage.clear();sessionStorage.clear();const paths:string[]=[];vi.stubGlobal('fetch',vi.fn(async(input:any,options:any)=>{const path=String(input);paths.push(path);if(path.endsWith('/device-session'))return Response.json({active:true,room:'ABCD1234'});if(path.endsWith('/socket-ticket'))return Response.json({ticket:'a'.repeat(32)});return Response.json({rows:[]});}));
 const page=render(<App/>);await waitFor(()=>expect(observed.urls).toHaveLength(1));expect(observed.urls[0]).toContain('code=ABCD1234');expect(page.container.querySelector('.screen-table')).not.toBeNull();expect(page.container.querySelector('.lobby')).toBeNull();expect(paths.some(p=>/\/api\/(rooms|join|quick)$/.test(p))).toBe(false);
});

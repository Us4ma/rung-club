// @vitest-environment jsdom
import React,{useState} from 'react';
import {afterEach,it,expect,vi} from 'vitest';
import {render,fireEvent,screen,waitFor,cleanup} from '@testing-library/react';
vi.mock('../apps/web/auth.ts',()=>({restoredIdentity:async()=>null}));
import {FriendControl} from '../apps/web/friends.tsx';
afterEach(cleanup);
const empty={friends:[],incoming:[],sent:[],invites:[],serverNow:Date.now()};
function model(act:any,data:any=empty):any{return {uid:'a',loaded:true,data,act};}
it('tap immediately shows a check, blocks repeated taps, and retains server confirmation despite stale lists',async()=>{let resolve:any;const act=vi.fn(()=>new Promise(r=>{resolve=r;}));const m=model(act);const ui=render(<FriendControl uid="b" model={m}/>);fireEvent.click(screen.getByRole('button',{name:'Add friend'}));expect(screen.getByRole('status').textContent).toContain('Sending request');expect(ui.container.querySelector('.friend-confirmed svg')).not.toBeNull();expect(screen.queryByRole('button',{name:'Add friend'})).toBeNull();expect(act).toHaveBeenCalledTimes(1);resolve({relationship:{status:'sent'}});await waitFor(()=>expect(screen.getByRole('status').textContent).toBe('Request sent'));ui.rerender(<FriendControl uid="b" model={model(act,{...empty})}/>);expect(screen.getByRole('status').textContent).toBe('Request sent');ui.rerender(<FriendControl uid="b" model={model(act,{...empty,friends:[{uid:'b'}]})}/>);await waitFor(()=>expect(screen.getByText('Friends')).toBeTruthy());expect(screen.queryByText('Resend')).toBeNull();});
it('failed request restores Add Friend and exposes the actual server error',async()=>{const act=vi.fn(async()=>{throw Error('Player unavailable');});render(<FriendControl uid="b" model={model(act)}/>);fireEvent.click(screen.getByRole('button',{name:'Add friend'}));await waitFor(()=>expect(screen.getByRole('alert').textContent).toBe('Player unavailable'));expect(screen.getByRole('button',{name:'Add friend'})).toBeTruthy();});
it('self has no control; pending request has no Resend action even after former cooldown',()=>{const m=model(vi.fn(),{...empty,sent:[{player:{uid:'b'},canResend:true}]});const ui=render(<FriendControl uid="a" model={m}/>);expect(ui.container.textContent).toBe('');ui.rerender(<FriendControl uid="b" model={m}/>);expect(screen.getByText('Request sent')).toBeTruthy();expect(screen.queryByRole('button')).toBeNull();});

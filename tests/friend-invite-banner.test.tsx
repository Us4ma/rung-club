// @vitest-environment jsdom
import React from 'react';
import {afterEach,it,expect,vi} from 'vitest';
import {render,fireEvent,screen,waitFor,cleanup} from '@testing-library/react';
vi.mock('../apps/web/auth.ts',()=>({restoredIdentity:async()=>null}));
import {FriendInviteBanner,FriendsDrawer} from '../apps/web/friends.tsx';
afterEach(cleanup);
const player=(uid:string)=>({uid,name:uid,avatar:1,level:1,online:true,playing:false});
const invite=(n:number,status='pending')=>({id:String(n),sender:player('sender'+n),target:player('me'),status,mode:'open',expires:Date.now()+19000+n,changed:n});
const model=(invites:any[]):any=>({uid:'me',serverOffset:0,data:{friends:[],incoming:[],sent:[],invites},act:vi.fn(async()=>({})),follow:vi.fn(),refresh:vi.fn(async()=>{})});
it('five invites show one at a time, cycle, and advance immediately after decline',async()=>{const m=model([1,2,3,4,5].map(n=>invite(n)));render(<FriendInviteBanner model={m}/>);expect(screen.getAllByText(/invited you to team up/)).toHaveLength(1);fireEvent.click(screen.getByText('Next invite · 5 waiting'));expect(screen.getByText('sender2 invited you to team up')).toBeTruthy();fireEvent.click(screen.getByText('Decline'));await waitFor(()=>expect(screen.getByText('sender1 invited you to team up')).toBeTruthy());expect(m.act).toHaveBeenCalledWith({action:'decline-invite',id:'2'});expect(screen.queryByText(/Invitation declined/)).toBeNull();});
it('recipient never sees terminal feedback; sender still sees declined feedback',()=>{const m=model([invite(1,'declined')]);const ui=render(<FriendInviteBanner model={m}/>);expect(ui.container.textContent).toBe('');m.uid='sender1';ui.rerender(<FriendInviteBanner model={m}/>);expect(ui.container.textContent).toContain('declined');});
it('expired incoming invitations cannot block the next live invitation',()=>{const expired={...invite(1),expires:Date.now()-1};render(<FriendInviteBanner model={model([expired,invite(2)])}/>);expect(screen.getByText('sender2 invited you to team up')).toBeTruthy();});
it('same-table friend has a disabled contextual button',()=>{const m=model([]);m.data.friends=[{...player('friend'),onYourTable:true}];render(<FriendsDrawer model={m} onClose={()=>{}} mode="open" safeBoundary onNewTable={async()=>{}}/>);expect((screen.getByText('On your table') as HTMLButtonElement).disabled).toBe(true);});

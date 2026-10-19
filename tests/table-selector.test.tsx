// @vitest-environment jsdom
import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,fireEvent,screen,waitFor,cleanup} from '@testing-library/react';
const request=vi.hoisted(()=>vi.fn());
vi.mock('../apps/web/friends.tsx',()=>({socialRequest:request,SocialIcon:()=> <span/>}));
vi.mock('../apps/web/art.tsx',()=>({Avatar:()=> <span/>}));
import {TableSelector} from '../apps/web/table-selector.tsx';
afterEach(()=>{cleanup();vi.clearAllMocks();});
const friends:any={data:{friends:[],invites:[]},refresh:vi.fn(),act:vi.fn()};
function show(wallet=10000){request.mockResolvedValue({wallet});const onPlay=vi.fn(async()=>{}),onClose=vi.fn();render(<TableSelector uid="a" name="Usama" avatar={1} initialCode="" friends={friends} onCode={()=>{}} onClose={onClose} onTable={async()=>{}} onPlay={onPlay}/>);return {onPlay,onClose};}
it('selects table/stake and full-wallet buy-in before play without charging during browsing',async()=>{const {onPlay}=show();await waitFor(()=>expect((screen.getByRole('button',{name:'Play at this table'}) as HTMLButtonElement).disabled).toBe(false));expect(screen.queryByRole('slider',{name:'Stake per deal'})).toBeNull();expect(screen.getAllByText('Min stake:')).toHaveLength(3);expect(screen.getAllByText('Max stake:')).toHaveLength(3);fireEvent.click(screen.getByLabelText(/Buy in at max/));fireEvent.click(screen.getByRole('button',{name:'Play at this table'}));await waitFor(()=>expect(onPlay).toHaveBeenCalledWith({tier:2500,stake:200},true));expect(request).toHaveBeenCalledTimes(1);});
it('routes unaffordable tables to the existing shop and provides FAQ and close controls',async()=>{const {onClose}=show(1000);const shop=vi.fn();window.addEventListener('rung:coin-shop',shop);await waitFor(()=>expect(screen.getAllByRole('button',{name:'Buy coins'})).toHaveLength(3));fireEvent.click(screen.getAllByRole('button',{name:'Buy coins'})[0]);expect(shop).toHaveBeenCalledOnce();fireEvent.click(screen.getByLabelText('Table FAQ'));expect(screen.getByRole('heading',{name:'Buy-in and wallet'})).toBeTruthy();fireEvent.click(screen.getByLabelText('Close FAQ'));fireEvent.click(screen.getByLabelText('Close table selection'));await waitFor(()=>expect(onClose).toHaveBeenCalledOnce());window.removeEventListener('rung:coin-shop',shop);});

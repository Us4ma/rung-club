// @vitest-environment jsdom
import React from 'react';
import {afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
const request=vi.hoisted(()=>vi.fn());
vi.mock('../apps/web/friends.tsx',()=>({socialRequest:request}));
import {CoinExperience,TableRefillStatus} from '../apps/web/coin-experience.tsx';
afterEach(()=>{cleanup();request.mockReset();});
const base={wallet:10000,table:null,welcomeAvailable:false};
it('welcome screen claims once and dismisses only after server success',async()=>{request.mockResolvedValueOnce({...base,welcomeAvailable:true}).mockResolvedValueOnce(base);const refresh=vi.fn();render(<CoinExperience motion={false} sound={false} uid="a" onLeave={()=>{}} onRefresh={refresh}/>);fireEvent.click(await screen.findByText('Claim 10,000 coins'));await waitFor(()=>expect(screen.queryByText('Claim 10,000 coins')).toBeNull());expect(request).toHaveBeenLastCalledWith('coins',{action:'welcome'});await waitFor(()=>expect(refresh).toHaveBeenCalledOnce());});
it('an empty wallet at a busted seat opens shop, exposes unavailable providers honestly and lets player leave',async()=>{request.mockResolvedValue({...base,wallet:0});const leave=vi.fn();render(<CoinExperience uid="a" table={{room:'ABCD1234',seat:0,started:true,coins:{stake:200,balances:[0,2500,2500,2500],waiting:[0],waitUntil:Date.now()+20000}}} onLeave={leave} onRefresh={()=>{}}/>);expect(await screen.findByRole('dialog',{name:'Coin shop'})).toBeTruthy();expect((screen.getByText('Unavailable') as HTMLButtonElement).disabled).toBe(true);fireEvent.click(screen.getByText('Leave table'));fireEvent.click(screen.getByText('Confirm leave'));expect(leave).toHaveBeenCalledOnce();});
it('a failed top-up retries using the same id and never sends an oversized amount',async()=>{request.mockImplementation(async(_path,body)=>{if(body.action==='state')return {...base,table:{room:'ABCD1234',balance:100}};throw Error('Connection interrupted');});render(<CoinExperience uid="a" table={{room:'ABCD1234',seat:0,started:true,coins:{stake:200,balances:[100,2500,2500,2500],waiting:[0],waitUntil:Date.now()+20000}}} onLeave={()=>{}} onRefresh={()=>{}}/>);const button=await screen.findByText('Add 2,400 coins');fireEvent.click(button);await screen.findByText('Connection interrupted');fireEvent.click(button);await waitFor(()=>expect(request.mock.calls.filter(([,b])=>b.action==='topup')).toHaveLength(2));const calls=request.mock.calls.filter(([,b])=>b.action==='topup');expect(calls[0][1].id).toBe(calls[1][1].id);expect(calls[0][1].amount).toBe(2400);});

it('keeps the rebuy dialog open through Back and exits only after confirmation',async()=>{
 request.mockResolvedValue(base);
 const leave=vi.fn();
 render(<CoinExperience uid="a" table={{room:'ABCD1234',seat:0,started:true,coins:{stake:200,balances:[0,2500,2500,2500],waiting:[0],waitUntil:Date.now()+20000}}} onLeave={leave} onRefresh={()=>{}}/>);
 await screen.findByText('Add 2,500 coins');
 fireEvent.click(screen.getByRole('button',{name:'Close coin options'}));
 expect(screen.queryByText('Confirm leave')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Close',exact:true}));
 fireEvent.click(screen.getByText('Keep my seat'));
 window.history.back();
 fireEvent.click(await screen.findByText('Keep my seat'));
 expect(screen.getByText('Add 2,500 coins')).toBeTruthy();
 const back=new Event('rung-device-back',{cancelable:true});
 fireEvent(window,back);
 expect(back.defaultPrevented).toBe(true);
 expect(leave).not.toHaveBeenCalled();
 fireEvent.click(screen.getByText('Confirm leave'));
 expect(leave).toHaveBeenCalledOnce();
});
it('keeps the refill prompt until the room acknowledges a successful top-up',async()=>{
 request.mockResolvedValue(base);
 const refresh=vi.fn(),table={room:'ABCD1234',seat:0,started:true,coins:{stake:200,balances:[0,2500,2500,2500],waiting:[0],waitUntil:Date.now()+20000}};
 const ui=render(<CoinExperience uid="a" table={table} onLeave={()=>{}} onRefresh={refresh}/>);
 fireEvent.click(await screen.findByText('Add 2,500 coins'));
 expect((await screen.findByText('Waiting for table…') as HTMLButtonElement).disabled).toBe(true);
 ui.rerender(<CoinExperience uid="a" table={{...table,coins:{...table.coins,waiting:[]}}} onLeave={()=>{}} onRefresh={refresh}/>);
 expect(screen.queryByRole('dialog')).toBeNull();
 expect(refresh).toHaveBeenCalledOnce();
});
it('shows the funded partner a countdown and a bot replacement notice',()=>{
 const coins={stake:200,balances:[0,2500,2500,2500],waiting:[0],waitUntil:Date.now()+20000};
 const ui=render(<TableRefillStatus room="ABCD1234" coins={coins} seat={2} bots={[false,true,false,true]} serverOffset={0}/>);
 expect(screen.getByRole('status').textContent).toMatch(/Waiting for your partner to refill · (19|20)s/);
 ui.rerender(<TableRefillStatus room="ABCD1234" coins={{...coins,waiting:[]}} seat={2} bots={[true,true,false,true]} serverOffset={0}/>);
 expect(screen.getByRole('status').textContent).toBe('A bot has taken the seat');
});

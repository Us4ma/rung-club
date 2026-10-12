// @vitest-environment jsdom
import React from 'react';
import {it,expect,vi,afterEach,beforeEach} from 'vitest';
import {render,screen,fireEvent,act,cleanup} from '@testing-library/react';
import {create,view,seeded} from '../packages/core/index.ts';
import {Session} from '../packages/protocol/index.ts';
import {automaticCommand} from '../packages/protocol/timing.ts';
const fixture=vi.hoisted(()=>({state:null as any}));
vi.mock('../packages/core/opening.ts',async original=>({...await original<any>(),createMatch:()=>structuredClone(fixture.state)}));
vi.mock('../apps/web/table.ts',()=>({mountTable:()=>({destroy:()=>{}})}));
import {App} from '../apps/web/main.tsx';
import {PileCollection} from '../apps/web/gameplay.tsx';
beforeEach(()=>{localStorage.clear();sessionStorage.clear();localStorage.setItem('welcome','1');});
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();});
it('finished practice announces result and starts next deal without Play Again, retaining table totals',async()=>{const session=new Session(create('open',seeded(20)));while(session.state.phase!=='finished')session.apply(session.state.turn,automaticCommand(session));fixture.state=session.state;render(<App/>);fireEvent.click(screen.getByRole('button',{name:'Play as a Guest'}));await screen.findByRole('button',{name:'Practice table'});vi.useFakeTimers();fireEvent.click(screen.getByRole('button',{name:'Practice table'}));expect(screen.getByText(/Next deal starts automatically/)).toBeTruthy();expect(screen.queryByRole('button',{name:/Play again/i})).toBeNull();const points=session.state.table!.points[0];expect(screen.getByText(new RegExp('^'+points+' match points ·'))).toBeTruthy();act(()=>vi.advanceTimersByTime(2400));expect(screen.getByText(/Deal 2/)).toBeTruthy();expect(screen.getByRole('generic',{name:'Your hand'}).querySelectorAll('button')).toHaveLength(5);expect(screen.getByText(new RegExp('^'+points+' match points ·'))).toBeTruthy();expect(screen.queryByText('Bhaag intent')).toBeNull();expect(document.querySelectorAll('.seat-d-tag')).toHaveLength(1);});
it('collected pile announces its designated caller recipient and is cleared on next deal',()=>{vi.useFakeTimers();const state=create(),before=view(state,0),after={...before,collections:[{sar:5,winner:2,recipient:0,team:0,count:5}],revision:20};const ui=render(<PileCollection v={before} motion={false} names={['Caller','Dealer','Partner','Opponent']}/>);ui.rerender(<PileCollection v={after} motion={false} names={['Caller','Dealer','Partner','Opponent']}/>);expect(screen.getByText('5 Sars')).toBeTruthy();expect(screen.getByText('To Caller')).toBeTruthy();ui.rerender(<PileCollection v={{...before,matchId:'next'}} motion={false} names={[]}/>);expect(screen.queryByText('5 Sars')).toBeNull();});

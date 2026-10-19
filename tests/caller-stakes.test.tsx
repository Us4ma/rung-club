// @vitest-environment jsdom
import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {RungBanner} from '../apps/web/gameplay.tsx';
import {create,view} from '../packages/core/index.ts';
afterEach(cleanup);
it('chooses trump and stake together and confirms exactly once without calling on slider movement',()=>{const onCall=vi.fn();render(<RungBanner v={view(create('open',()=>.4),0)} seat={0} seconds={20} timed disabled={()=>false} onCall={onCall} stakes={{min:200,max:1000,step:100}}/>);fireEvent.click(screen.getByRole('button',{name:'♠'}));fireEvent.change(screen.getByRole('slider',{name:'Stake per player'}),{target:{value:'700'}});expect(onCall).not.toHaveBeenCalled();fireEvent.click(screen.getByRole('button',{name:'Confirm Rung · 700 coins'}));expect(onCall).toHaveBeenCalledWith('S',700);});
it('only the trump caller sees stake controls',()=>{render(<RungBanner v={view(create('open',()=>.4),1)} seat={1} seconds={20} timed disabled={()=>false} onCall={()=>{}} stakes={{min:200,max:1000,step:100}}/>);expect(screen.queryByRole('slider')).toBeNull();expect(screen.getByText('Waiting for trump caller…')).toBeTruthy();});

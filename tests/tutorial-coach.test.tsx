// @vitest-environment jsdom
import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,act,cleanup,fireEvent} from '@testing-library/react';
import {DealerTable} from '../apps/web/experience.tsx';
import {TutorialCutCheck,TUTORIAL_INTRO} from '../apps/web/tutorial-coach.tsx';
import {firstDeal} from '../packages/core/first-deal.ts';
import {view} from '../packages/core/index.ts';
vi.mock('../apps/web/table-audio.ts',()=>({tableAudio:{effect:vi.fn()}}));
afterEach(()=>{cleanup();vi.useRealTimers();vi.unstubAllGlobals();});
it('explains teams before any cards and waits for the learner, including reduced motion',()=>{
 vi.useFakeTimers();vi.stubGlobal('matchMedia',()=>({matches:true}));vi.stubGlobal('ResizeObserver',class{observe(){}disconnect(){}});
 const container=React.createRef<HTMLDivElement>(),hand=vi.fn(),busy=vi.fn();
 const ui=render(<div ref={container}><div className="table"/><DealerTable v={view(firstDeal(),0)} tutorial motion={false} active localSeat={0} container={container} onHand={hand} onBusy={busy}/></div>);
 expect(ui.getByText(TUTORIAL_INTRO[0])).toBeTruthy();expect(hand).toHaveBeenLastCalledWith([]);
 act(()=>vi.advanceTimersByTime(3000));expect(ui.getByText(TUTORIAL_INTRO[1])).toBeTruthy();
 act(()=>vi.advanceTimersByTime(60000));expect(ui.getByText(TUTORIAL_INTRO[1])).toBeTruthy();expect(ui.container.querySelector('.opening-draw')).toBeNull();
 fireEvent.click(ui.getByText('Got it'));expect(container.current?.dataset.tutorialSeats).toBe('team');
 for(let i=2;i<TUTORIAL_INTRO.length;i++){expect(ui.getByText(TUTORIAL_INTRO[i])).toBeTruthy();expect(ui.container.querySelector('.opening-draw')).toBeNull();act(()=>vi.advanceTimersByTime(1000));fireEvent.click(ui.getByText(i===TUTORIAL_INTRO.length-1?'Draw the cards':'Got it'));}
 act(()=>vi.advanceTimersByTime(1));expect(ui.container.querySelector('.opening-draw')).toBeTruthy();expect(busy).toHaveBeenLastCalledWith(true);
 act(()=>vi.advanceTimersByTime(4200+1000+5000));expect(busy).toHaveBeenLastCalledWith(false);expect(container.current?.dataset.tutorialSeats).toBeUndefined();
});
it('lets the learner try an answer and explains an incorrect cut without advancing',()=>{const correct=vi.fn(),ui=render(<TutorialCutCheck onCorrect={correct}/>);fireEvent.click(ui.getByText('K♦ · diamonds'));expect(correct).not.toHaveBeenCalled();expect(ui.getByText(/Diamonds are not Rung/)).toBeTruthy();fireEvent.click(ui.getByText('2♠ · Rung'));expect(correct).toHaveBeenCalledOnce();});

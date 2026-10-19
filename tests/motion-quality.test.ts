// @vitest-environment jsdom
import {it,expect,vi,afterEach} from 'vitest';
import {installMotionQuality} from '../apps/web/motion-quality.ts';
afterEach(()=>{vi.restoreAllMocks();vi.useRealTimers();});
it('uses a lighter preset on constrained hardware and cleans up sampling',()=>{
 vi.useFakeTimers();vi.spyOn(navigator,'hardwareConcurrency','get').mockReturnValue(2);
 const stop=installMotionQuality();expect(document.documentElement.dataset.effects).toBe('lite');stop();expect(vi.getTimerCount()).toBe(0);
});
it('requires sustained slow frames before reducing effects and stops in hidden tabs',()=>{
 vi.useFakeTimers();vi.spyOn(navigator,'hardwareConcurrency','get').mockReturnValue(8);vi.spyOn(document,'hidden','get').mockReturnValue(false);
 let callback:FrameRequestCallback=()=>{};vi.spyOn(window,'requestAnimationFrame').mockImplementation(fn=>{callback=fn;return 1;});const cancel=vi.spyOn(window,'cancelAnimationFrame');
 const stop=installMotionQuality();vi.advanceTimersByTime(1500);let time=100;
 for(let n=0;n<121;n++)callback(time+=34);expect(document.documentElement.dataset.effects).toBe('full');
 vi.advanceTimersByTime(15000);for(let n=0;n<121;n++)callback(time+=34);expect(document.documentElement.dataset.effects).toBe('lite');
 vi.spyOn(document,'hidden','get').mockReturnValue(true);document.dispatchEvent(new Event('visibilitychange'));expect(cancel).toHaveBeenCalled();expect(vi.getTimerCount()).toBe(0);stop();
});

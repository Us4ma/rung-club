import {it,expect,vi,afterEach} from 'vitest';
import {initialSoundSettings} from '../apps/web/sound.tsx';
afterEach(()=>vi.unstubAllGlobals());
function saved(value:string|null){vi.stubGlobal('localStorage',{getItem:()=>value});}
it('enables supplied music on introduction without changing prior SFX/haptics',()=>{saved('{"sound":true,"music":false,"haptic":true}');expect(initialSoundSettings()).toMatchObject({music:true,sound:true,haptic:true,musicVolume:.35,lobbyMusicConfigured:true});});
it('keeps an explicit music-off choice and volume after reload',()=>{saved('{"music":false,"musicVolume":0.7,"lobbyMusicConfigured":true}');expect(initialSoundSettings()).toMatchObject({music:false,musicVolume:.7});});
it('recovers defaults from invalid saved settings',()=>{saved('broken');expect(initialSoundSettings()).toMatchObject({music:true,musicVolume:.35});});

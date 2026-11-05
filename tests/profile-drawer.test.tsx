// @vitest-environment jsdom
import React from 'react';
import {afterEach,it,expect,vi} from 'vitest';
import {render,cleanup,fireEvent,screen} from '@testing-library/react';
vi.mock('../apps/web/league-ui.tsx',()=>({LeagueProfileHonors:()=>null}));
import {ProfileDrawer} from '../apps/web/profile-drawer.tsx';
vi.stubGlobal('requestAnimationFrame',(f:()=>void)=>{f();return 0;});
afterEach(cleanup);
const props={name:'Usama',avatar:2,xp:100,stats:{},closing:false,onClose:vi.fn(),cloud:true,nameEditor:()=>null};
it('keeps Google photo in navigation and opens one collection with back navigation',()=>{
 const photo='https://lh3.googleusercontent.com/a/profile';
 const ui=render(<ProfileDrawer {...props} photo={photo} frames={<button>Frame option</button>}><button>Google photo option</button></ProfileDrawer>);
 const link=screen.getByRole('button',{name:'Avatars'});
 expect(link.querySelector('img')?.getAttribute('src')).toBe(photo);
 expect(screen.queryByRole('button',{name:'Google photo option'})).toBeNull();
 fireEvent.click(link);
 expect(screen.getByRole('button',{name:'Google photo option'})).toBeTruthy();
 expect(screen.queryByRole('tab')).toBeNull();
 expect(screen.queryByRole('button',{name:'Frame option'})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Back to profile'}));
 expect(screen.getByRole('tab',{name:'Stats'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Milestone frames'}));
 expect(screen.getByRole('button',{name:'Frame option'})).toBeTruthy();
 expect(ui.container.querySelector('.collection-preview img')?.getAttribute('src')).toBe(photo);
});
it('updates equipped thumbnail after switching away from a Google photo',()=>{
 const ui=render(<ProfileDrawer {...props} photo="https://lh3.googleusercontent.com/a/profile"><span>Avatars</span></ProfileDrawer>);
 ui.rerender(<ProfileDrawer {...props} avatar={5}><span>Avatars</span></ProfileDrawer>);
 expect(screen.getByRole('button',{name:'Avatars'}).querySelector('img')?.getAttribute('src')).toContain('avatar_05.webp');
});

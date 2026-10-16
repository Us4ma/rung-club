// @vitest-environment jsdom
import {afterEach,beforeEach,it,expect,vi} from 'vitest';
const token=vi.hoisted(()=>vi.fn());
vi.mock('../apps/web/auth.ts',()=>({restoredIdentity:async()=>({getIdToken:token})}));
import {accountProfile} from '../apps/web/username.tsx';
const saved={user:{uid:'google-member',name:'Muhammad Usama Qamar'},totals:{xp:120}};
beforeEach(()=>{localStorage.clear();token.mockReset().mockResolvedValue('verified');vi.stubGlobal('fetch',vi.fn());});
afterEach(()=>vi.unstubAllGlobals());
it('recovers a temporary profile failure through the same-origin route',async()=>{vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce(Response.json(saved));expect(await accountProfile()).toEqual(saved);expect(fetch).toHaveBeenCalledTimes(2);expect(fetch).toHaveBeenLastCalledWith('/api/identity',expect.objectContaining({method:'GET'}));});
it('refreshes an expired token once while preserving the existing Google profile',async()=>{vi.mocked(fetch).mockResolvedValueOnce(Response.json({error:'Please sign in again.'},{status:401})).mockResolvedValueOnce(Response.json(saved));expect(await accountProfile()).toEqual(saved);expect(token).toHaveBeenCalledWith(true);});
it('does not retry rejected names or hide the server error',async()=>{vi.mocked(fetch).mockResolvedValue(Response.json({error:'That name is taken.'},{status:409}));await expect(accountProfile('Usama')).rejects.toThrow('That name is taken.');expect(fetch).toHaveBeenCalledTimes(1);});
it('recovers a transient service outage without opening a name screen',async()=>{vi.mocked(fetch).mockResolvedValueOnce(new Response('Unavailable',{status:503})).mockResolvedValueOnce(Response.json(saved));expect((await accountProfile()).user.name).toBe(saved.user.name);});

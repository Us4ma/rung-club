// @vitest-environment jsdom
import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
const auth=vi.hoisted(()=>({google:vi.fn(),email:vi.fn(),restored:vi.fn()}));
vi.mock('../apps/web/auth.ts',()=>({configured:true,restoredIdentity:auth.restored,secureGuestGoogle:auth.google,secureGuestEmail:auth.email,authMessage:(e:Error)=>e.message}));
import {AccountProtection} from '../apps/web/account-protection.tsx';
beforeEach(()=>{vi.clearAllMocks();auth.restored.mockResolvedValue({isAnonymous:true});});afterEach(cleanup);
it('guest can protect with email and keeps password out of persistent storage',async()=>{auth.email.mockResolvedValue({uid:'guest'});render(<AccountProtection/>);await screen.findByText('Link a sign-in method to keep access to this guest account.');fireEvent.change(screen.getByLabelText('Email address'),{target:{value:'guest@example.com'}});fireEvent.change(screen.getByLabelText('Create password'),{target:{value:'private123'}});fireEvent.click(screen.getByRole('button',{name:'Protect with email'}));await screen.findByRole('heading',{name:'Account protected'});expect(auth.email).toHaveBeenCalledWith('guest@example.com','private123');expect(JSON.stringify(localStorage)).not.toContain('private123');});
it('offers Google and preserves form on conflict',async()=>{auth.google.mockRejectedValue(Error('Account conflict'));render(<AccountProtection/>);fireEvent.click(screen.getByRole('button',{name:'Protect with Google'}));expect((await screen.findByRole('alert')).textContent).toBe('Account conflict');expect(screen.getByRole('button',{name:'Protect with email'})).toBeTruthy();});
it('linked members are not offered guest linking',async()=>{auth.restored.mockResolvedValue({isAnonymous:false});render(<AccountProtection/>);await screen.findByRole('heading',{name:'Account protected'});expect(screen.queryByRole('button',{name:'Protect with Google'})).toBeNull();});

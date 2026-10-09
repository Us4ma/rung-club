import {configured} from './auth-config.ts';
export {configured};
export {authMessage} from './auth-message.ts';
type AuthModule=typeof import('./auth-implementation.ts');
let pending:Promise<AuthModule>|undefined;
const load=()=>pending??=import('./auth-implementation.ts').catch(error=>{pending=undefined;throw error;});
export async function restoredIdentity(){return configured?(await load()).restoredIdentity():null;}
export async function guestLogin(){return configured?(await load()).guestLogin():{local:true};}
export async function logout(){if(configured)await (await load()).logout();}
export async function secureSession(...args:Parameters<AuthModule['secureSession']>){return (await load()).secureSession(...args);}
export async function emailLogin(...args:Parameters<AuthModule['emailLogin']>){return (await load()).emailLogin(...args);}
export async function socialLogin(...args:Parameters<AuthModule['socialLogin']>){return (await load()).socialLogin(...args);}
export async function resetPassword(...args:Parameters<AuthModule['resetPassword']>){return (await load()).resetPassword(...args);}
export async function protectAccount(...args:Parameters<AuthModule['protectAccount']>){return (await load()).protectAccount(...args);}
export async function removeIdentity(...args:Parameters<AuthModule['removeIdentity']>){return (await load()).removeIdentity(...args);}
export async function secureGuestGoogle(...args:Parameters<AuthModule['secureGuestGoogle']>){return (await load()).secureGuestGoogle(...args);}
export async function secureGuestEmail(...args:Parameters<AuthModule['secureGuestEmail']>){return (await load()).secureGuestEmail(...args);}

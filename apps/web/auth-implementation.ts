import {initializeApp} from 'firebase/app';
import {getAuth,signInAnonymously,GoogleAuthProvider,FacebookAuthProvider,EmailAuthProvider,linkWithCredential,linkWithPopup,signInWithPopup,signInWithRedirect,getRedirectResult,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendPasswordResetEmail,sendEmailVerification,deleteUser,signOut,reauthenticateWithCredential,reauthenticateWithPopup} from 'firebase/auth';
import {Capacitor} from '@capacitor/core';
import {config,configured} from './auth-config.ts';
const auth=configured?getAuth(initializeApp(config)):null;
const SIGNED_OUT='rung:signed-out';
const locked=()=>localStorage.getItem(SIGNED_OUT)==='1';
function required(){if(!auth)throw Error('Cloud sign-in is not configured on this build. Guest practice is available.');return auth;}
export async function restoredIdentity(){if(!auth)return null;await auth.authStateReady();return locked()?null:auth.currentUser;}
export async function completeRedirectLogin(){if(!auth)return null;const result=await getRedirectResult(auth);if(result)localStorage.removeItem(SIGNED_OUT);return result?.user??null;}
export async function secureSession(){const a=required();await a.authStateReady();if(locked())throw Error('Please enter the club before continuing.');const user=a.currentUser||(await signInAnonymously(a)).user;return {token:await user.getIdToken()};}
export async function guestLogin(){if(!configured)return {local:true};const wasLocked=locked();localStorage.removeItem(SIGNED_OUT);try{await secureSession();return {local:false};}catch(e){if(wasLocked)localStorage.setItem(SIGNED_OUT,'1');throw e;}}
export async function emailLogin(email:string,password:string,register=false){const a=required();await a.authStateReady();if(register){const result=a.currentUser?.isAnonymous?await linkWithCredential(a.currentUser,EmailAuthProvider.credential(email,password)):await createUserWithEmailAndPassword(a,email,password);await sendEmailVerification(result.user).catch(()=>{});localStorage.removeItem(SIGNED_OUT);return result.user;}const result=await signInWithEmailAndPassword(a,email,password);localStorage.removeItem(SIGNED_OUT);return result.user;}
export async function socialLogin(provider:'google'|'facebook'){if(Capacitor.isNativePlatform())throw Error('Social sign-in is available in the browser version while native sign-in is being set up. Use email or guest here.');const a=required();await a.authStateReady();const p=provider==='google'?new GoogleAuthProvider():new FacebookAuthProvider();p.setCustomParameters({prompt:'select_account'});try{const result=await signInWithPopup(a,p);localStorage.removeItem(SIGNED_OUT);return result.user;}catch(e){if((e as {code?:string})?.code!=='auth/popup-blocked')throw e;await signInWithRedirect(a,p);return null;}}
export async function resetPassword(email:string){await sendPasswordResetEmail(required(),email);}
export async function protectAccount(){const user=await socialLogin('google');return user?'Account linked. Your existing UID and progress are preserved.':'Continuing Google sign-in…';}
export async function removeIdentity(){if(!auth?.currentUser)throw Error('No cloud identity');await deleteUser(auth.currentUser);localStorage.removeItem(SIGNED_OUT);}
export async function logout(){if(!auth)return;await auth.authStateReady();if(!auth.currentUser?.isAnonymous)await signOut(auth);localStorage.setItem(SIGNED_OUT,'1');}

async function guestToProtect(){const a=required();await a.authStateReady();if(locked())throw Error('Please enter the club before continuing.');const user=a.currentUser||(await signInAnonymously(a)).user;if(!user.isAnonymous)throw Error('This account is already linked. Sign in with its existing method.');return user;}
export async function secureGuestGoogle(){if(Capacitor.isNativePlatform())throw Error('Google linking is available in the browser. Use email in the Android app.');return (await linkWithPopup(await guestToProtect(),new GoogleAuthProvider())).user;}
export async function secureGuestEmail(email:string,password:string){const user=await guestToProtect();const linked=(await linkWithCredential(user,EmailAuthProvider.credential(email,password))).user;await sendEmailVerification(linked).catch(()=>{});return linked;}

export async function deletionSession(password?:string){
 const a=required();await a.authStateReady();const user=a.currentUser;if(!user||locked())throw Error('Please sign in before deleting an account.');
 if(!user.isAnonymous){
  if(user.providerData.some(provider=>provider.providerId==='password')){if(!password)throw Error('Enter your password to confirm.');await reauthenticateWithCredential(user,EmailAuthProvider.credential(user.email!,password));}
  else if(user.providerData.some(provider=>provider.providerId==='google.com')){if(Capacitor.isNativePlatform())throw Error('Delete your Google-linked account in the browser version.');await reauthenticateWithPopup(user,new GoogleAuthProvider());}
  else throw Error('Sign in with your original provider before deleting this account.');
 }
 return {token:await user.getIdToken(true),uid:user.uid};
}

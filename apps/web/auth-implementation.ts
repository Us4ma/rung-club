import {initializeApp} from 'firebase/app';
import {getAuth,signInAnonymously,GoogleAuthProvider,FacebookAuthProvider,EmailAuthProvider,linkWithCredential,linkWithPopup,signInWithPopup,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendPasswordResetEmail,sendEmailVerification,deleteUser,signOut} from 'firebase/auth';
import {Capacitor} from '@capacitor/core';
import {config,configured} from './auth-config.ts';
const auth=configured?getAuth(initializeApp(config)):null;
function required(){if(!auth)throw Error('Cloud sign-in is not configured on this build. Guest practice is available.');return auth;}
export async function restoredIdentity(){if(!auth)return null;await auth.authStateReady();return auth.currentUser;}
export async function secureSession(){const a=required();await a.authStateReady();const user=a.currentUser||(await signInAnonymously(a)).user;return {token:await user.getIdToken()};}
export async function guestLogin(){if(!configured)return {local:true};await secureSession();return {local:false};}
export async function emailLogin(email:string,password:string,register=false){const a=required();await a.authStateReady();if(register){const result=a.currentUser?.isAnonymous?await linkWithCredential(a.currentUser,EmailAuthProvider.credential(email,password)):await createUserWithEmailAndPassword(a,email,password);await sendEmailVerification(result.user).catch(()=>{});return result.user;}return (await signInWithEmailAndPassword(a,email,password)).user;}
export async function socialLogin(provider:'google'|'facebook'){if(Capacitor.isNativePlatform())throw Error('Social sign-in is available in the browser version while native sign-in is being set up. Use email or guest here.');const a=required();await a.authStateReady();const p=provider==='google'?new GoogleAuthProvider():new FacebookAuthProvider();return (a.currentUser?.isAnonymous?await linkWithPopup(a.currentUser,p):await signInWithPopup(a,p)).user;}
export async function resetPassword(email:string){await sendPasswordResetEmail(required(),email);}
export async function protectAccount(){await socialLogin('google');return 'Account linked. Your existing UID and progress are preserved.';}
export async function removeIdentity(){if(!auth?.currentUser)throw Error('No cloud identity');await deleteUser(auth.currentUser);}
export async function logout(){if(auth)await signOut(auth);}

async function guestToProtect(){const a=required();await a.authStateReady();const user=a.currentUser||(await signInAnonymously(a)).user;if(!user.isAnonymous)throw Error('This account is already linked. Sign in with its existing method.');return user;}
export async function secureGuestGoogle(){if(Capacitor.isNativePlatform())throw Error('Google linking is available in the browser. Use email in the Android app.');return (await linkWithPopup(await guestToProtect(),new GoogleAuthProvider())).user;}
export async function secureGuestEmail(email:string,password:string){const user=await guestToProtect();const linked=(await linkWithCredential(user,EmailAuthProvider.credential(email,password))).user;await sendEmailVerification(linked).catch(()=>{});return linked;}

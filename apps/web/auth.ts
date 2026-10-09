import {initializeApp} from 'firebase/app';import {getAuth,signInAnonymously,GoogleAuthProvider,linkWithPopup,deleteUser,signOut} from 'firebase/auth';
import {cloudHost,publicFirebaseConfig} from './deployment.ts';
const defaults=import.meta.env.PROD&&cloudHost?publicFirebaseConfig:undefined;
const config={apiKey:import.meta.env.VITE_FIREBASE_API_KEY||defaults?.apiKey,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN||defaults?.authDomain,projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID||defaults?.projectId};
export const configured=Boolean(config.apiKey&&config.authDomain&&config.projectId);
const auth=configured?getAuth(initializeApp(config)):null;
export async function secureSession(){if(!auth)throw Error('Cloud account not configured');await auth.authStateReady();const user=auth.currentUser||(await signInAnonymously(auth)).user;return {token:await user.getIdToken()};}
export async function protectAccount(){if(!auth?.currentUser)throw Error('Play online first to create a cloud guest');try{await linkWithPopup(auth.currentUser,new GoogleAuthProvider());return 'Account linked. Your existing UID and progress are preserved.';}catch(e){if((e as {code?:string}).code==='auth/credential-already-in-use')throw Error('That Google account already has a profile. Linking was cancelled to preserve both accounts. Progress merging is not supported.');throw e;}}
export async function removeIdentity(){if(!auth?.currentUser)throw Error('No cloud identity');await deleteUser(auth.currentUser);}
export async function logout(){if(auth)await signOut(auth);}

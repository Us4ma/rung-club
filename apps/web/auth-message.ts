export function authMessage(e:unknown){const code=(e as {code?:string})?.code;const messages:Record<string,string>={
 'auth/operation-not-allowed':'This sign-in method has not been enabled yet. Please use guest play for now.',
 'auth/unauthorized-domain':'Sign-in is not enabled for this website yet. Please use guest practice for now.',
 'auth/popup-closed-by-user':'Sign-in cancelled. You can try again or continue as a guest.',
 'auth/popup-blocked':'Your browser blocked the sign-in window. Allow popups and try again.',
 'auth/invalid-credential':'Unable to sign in. Check your email and password.',
 'auth/user-not-found':'Unable to sign in. Check your email and password.',
 'auth/wrong-password':'Unable to sign in. Check your email and password.',
 'auth/email-already-in-use':'This email already has an account. Sign in instead. Your guest account has not been merged.',
 'auth/credential-already-in-use':'This account already has a profile. Your guest profile is preserved; sign out before signing into the existing account. Automatic merging is not supported.',
 'auth/account-exists-with-different-credential':'This email uses another sign-in method. Use the original method; your current account has not been merged.',
 'auth/weak-password':'Choose a stronger password (at least six characters).',
 'auth/too-many-requests':'Too many attempts. Please wait before trying again.',
 'auth/network-request-failed':'Unable to reach sign-in. Check your connection or use guest practice.'};return code?messages[code]||'Sign-in could not finish. Please try again.':e instanceof Error?e.message:'Sign-in could not finish.';}

import type {IdentityDatabase} from './identity.ts';
import {playerStats} from './player-stats.ts';
import {playerAvatar} from './avatar-profile.ts';
import {publicGoogleProfile} from './google-profile.ts';
/** Called only after the room verifies that the viewer occupies a seat. */
export async function publicPlayerProfile(db:IdentityDatabase,uid:string){
 const account=await db.prepare('SELECT name FROM accounts WHERE uid=? AND deleted=0').bind(uid).first<{name:string}>();
 if(!account)return null;
 const [stats,avatar,google,total]=await Promise.all([playerStats(db,uid),playerAvatar(db,uid),publicGoogleProfile(db,uid),db.prepare('SELECT COALESCE(SUM(xp),0) xp FROM ledger WHERE uid=?').bind(uid).first<{xp:number}>()]);
 return {name:google.displayName||(/^Guest-/i.test(account.name)?'Guest':account.name),avatar,photoURL:google.photoURL,xp:total?.xp||0,stats,isBot:false};
}

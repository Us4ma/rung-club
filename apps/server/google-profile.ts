import {safeAvatarPhoto} from '../../packages/protocol/avatars.ts';
import type {IdentityDatabase,VerifiedIdentity} from './identity.ts';
const prefix='profile:google:';
export async function syncGoogleProfile(db:IdentityDatabase,identity:VerifiedIdentity){
 if(!identity.google)return;
 const displayName=typeof identity.name==='string'?identity.name.replace(/[\x00-\x1f\x7f]/g,'').trim().slice(0,60):'';
 const photoURL=safeAvatarPhoto(identity.picture);if(!displayName&&!photoURL)return;
 const old=await db.prepare("SELECT item FROM cosmetics WHERE uid=? AND item LIKE 'profile:google:%' LIMIT 1").bind(identity.uid).first();if(old)return;
 if(!db.batch)throw Error('Profile saving unavailable');
 await db.batch([db.prepare('DELETE FROM cosmetics WHERE uid=? AND item=?').bind(identity.uid,'profile:avatar-source:roster'),db.prepare("INSERT OR IGNORE INTO cosmetics(uid,item) SELECT ?,? WHERE NOT EXISTS(SELECT 1 FROM cosmetics WHERE uid=? AND item LIKE 'profile:google:%')").bind(identity.uid,prefix+JSON.stringify({displayName,photoURL}),identity.uid),db.prepare('INSERT OR IGNORE INTO cosmetics(uid,item) VALUES(?,?)').bind(identity.uid,'profile:google-name-default')]);
 const user=await db.prepare('SELECT name FROM accounts WHERE uid=?').bind(identity.uid).first<{name:string}>();
 if(displayName&&user?.name.startsWith('Guest-')){const base=displayName.normalize('NFKD').replace(/[^A-Za-z0-9_]/g,'').slice(0,12)||'Player';const suffix=identity.uid.replace(/[^A-Za-z0-9]/g,'').slice(0,7);await db.prepare("UPDATE accounts SET name=? WHERE uid=? AND name LIKE 'Guest-%'").bind(base+'_'+suffix,identity.uid).run();}
}
export async function publicGoogleProfile(db:IdentityDatabase,uid:string){
 const rows=await db.prepare("SELECT item FROM cosmetics WHERE uid=? AND (item LIKE 'profile:google:%' OR item IN ('profile:google-name-default','profile:avatar-source:roster'))").bind(uid).all();const items=rows.results.map(r=>(r as {item:string}).item),item=items.find(x=>x.startsWith(prefix));
 if(!item)return {};try{const data=JSON.parse(item.slice(prefix.length)),googlePhotoURL=safeAvatarPhoto(data.photoURL);return {displayName:items.includes('profile:google-name-default')?data.displayName:undefined,googlePhotoURL,photoURL:items.includes('profile:avatar-source:roster')?undefined:googlePhotoURL};}catch{return {};}
}
/** Restore the verified Google photo from the profile stored on first Google sign-in. */
export async function selectGoogleAvatar(db:IdentityDatabase,uid:string){
 const row=await db.prepare("SELECT item FROM cosmetics WHERE uid=? AND item LIKE 'profile:google:%' LIMIT 1").bind(uid).first<{item:string}>();
 if(!row||!safeAvatarPhoto((JSON.parse(row.item.slice(prefix.length)) as {photoURL?:unknown}).photoURL))throw Error('No Google profile photo is linked to this account.');
 if(!db.batch)throw Error('Avatar saving unavailable.');
 await db.batch([db.prepare('DELETE FROM cosmetics WHERE uid=? AND item=?').bind(uid,'profile:avatar-source:roster')]);
}

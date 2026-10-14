import {randomAvatar,validAvatar} from '../../packages/protocol/avatars.ts';
import type {IdentityDatabase} from './identity.ts';
const prefix='profile:avatar-v2:';
export async function playerAvatar(db:IdentityDatabase,uid:string,selected?:number,legacy?:number):Promise<number>{
 if(selected!==undefined){if(!validAvatar(selected))throw Error('Invalid avatar');if(!db.batch)throw Error('Avatar saving unavailable');await db.batch([db.prepare("DELETE FROM cosmetics WHERE uid=? AND item LIKE 'profile:avatar-v2:%'").bind(uid),db.prepare('INSERT INTO cosmetics(uid,item) VALUES(?,?)').bind(uid,prefix+selected),db.prepare('INSERT OR IGNORE INTO cosmetics(uid,item) VALUES(?,?)').bind(uid,'profile:avatar-source:roster')]);return selected;}
 await db.prepare("INSERT OR IGNORE INTO cosmetics(uid,item) SELECT ?,? WHERE NOT EXISTS(SELECT 1 FROM cosmetics WHERE uid=? AND item LIKE 'profile:avatar-v2:%')").bind(uid,prefix+(validAvatar(legacy)?legacy:randomAvatar()),uid).run();
 const row=await db.prepare("SELECT item FROM cosmetics WHERE uid=? AND item LIKE 'profile:avatar-v2:%' ORDER BY item LIMIT 1").bind(uid).first<{item:string}>();const id=Number(row?.item.slice(prefix.length));return validAvatar(id)?id:playerAvatar(db,uid,randomAvatar());
}

/** Public, versioned player-avatar identifiers. No gameplay data is stored here. */
export const AVATAR_COUNT=9;
export const validAvatar=(id:unknown):id is number=>Number.isInteger(id)&&Number(id)>=1&&Number(id)<=AVATAR_COUNT;
export function randomAvatar(){const n=new Uint32Array(1);do{crypto.getRandomValues(n);}while(n[0]>=4294967292);return 1+n[0]%AVATAR_COUNT;}
export const BAND_AVAILABLE=false;

export const TUTORIAL_AVAILABLE=false;
export function safeAvatarPhoto(value:unknown):string|undefined{if(typeof value!=='string'||value.length>1500)return;try{const u=new URL(value);if(u.protocol==='https:'&&!u.username&&!u.password&&(u.hostname==='googleusercontent.com'||u.hostname.endsWith('.googleusercontent.com')))return u.href;}catch{}}

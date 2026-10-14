/** Public, versioned player-avatar identifiers. No gameplay data is stored here. */
export const AVATAR_COUNT=5;
export const validAvatar=(id:unknown):id is number=>Number.isInteger(id)&&Number(id)>=1&&Number(id)<=AVATAR_COUNT;
export function randomAvatar(){const n=new Uint32Array(1);do{crypto.getRandomValues(n);}while(n[0]>=4294967295);return 1+n[0]%AVATAR_COUNT;}
export const BAND_AVAILABLE=false;

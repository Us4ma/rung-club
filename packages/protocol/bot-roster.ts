/** Casual AI identities are always labelled as bots by room snapshots and the UI. */
export const OPEN_BOTS=['Hamza','Uzair','Zain','Ayesha','Fatima','Ali','Bilal','Hassan','Usman','Sara','Aarav','Arjun','Kabir','Rohan','Aditya','Rahul','Priya','Ananya','Meera','Isha'] as const;
export function pickOpenBots(){const pool=[...OPEN_BOTS];for(let i=pool.length-1;i>0;i--){const n=new Uint32Array(1);crypto.getRandomValues(n);const j=n[0]%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.slice(0,3);}
export function botWantsToLeave(){const n=new Uint32Array(1);crypto.getRandomValues(n);return n[0]%5===0;}

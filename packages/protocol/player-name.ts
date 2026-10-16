/** Stable card-room names for guest accounts; never changes their player ID. */
export function guestName(id:string){let hash=2166136261;for(const c of id)hash=Math.imul(hash^c.charCodeAt(0),16777619);const words=['Diamond','HighCard','RoyalFlush','Emerald','LuckyAce','SilverSpade','HeartKing','GoldenJack','ClubQueen','WildCard','FullHouse','Straight'];return words[(hash>>>0)%words.length]+id.replace(/[^A-Za-z0-9]/g,'').slice(-10);}
export const validPlayerName=(name:unknown):name is string=>typeof name==='string'&&name===name.trim()&&/^[\p{L}\p{N}][\p{L}\p{N} _.'-]{2,39}$/u.test(name)&&!/^(guest|deleted)([_ -]|$)/i.test(name);

/** Only generated defaults are shortened; chosen player names are preserved. */
export function publicPlayerName(name:string,id:string){if(name===guestName(id)||name.startsWith('Guest-'))return guestName(id).slice(0,-id.replace(/[^A-Za-z0-9]/g,'').slice(-10).length).replace(/([a-z])([A-Z])/g,'$1 $2');return name;}

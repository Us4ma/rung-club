/** Truncate display only; financial values always remain integer coins. */
export function compactCoins(value:number){if(!Number.isSafeInteger(value)||value<0)return '—';for(const [size,suffix] of [[1e15,'Q'],[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']] as const)if(value>=size)return (Math.floor(value/size*10)/10).toLocaleString('en-US',{maximumFractionDigits:1})+suffix;return String(value);}

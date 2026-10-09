export const BRAND={name:'Rung Club',tagline:'Good cards. Better company.',currency:'Tokens'};
export const FEATURES={economy:false,productionAds:false};
export const SUITS:Record<string,string>={S:'♠',H:'♥',D:'♦',C:'♣'};
export const rank=(n:number)=>({11:'J',12:'Q',13:'K',14:'A'}[n]||String(n));

/** Weekly leagues are independent of lifetime records and wallet balances. */
export const LEAGUES=[
 {name:'Bronze',color:'#bc8756',prizes:[1000,600,400,150]},
 {name:'Silver',color:'#b5c7ce',prizes:[2000,1200,800,300]},
 {name:'Gold',color:'#dfbd65',prizes:[4000,2400,1600,600]},
 {name:'Champions',color:'#69c6ae',prizes:[6000,3600,2400,900]},
 {name:'World Champions',color:'#bd98dc',prizes:[10000,6000,4000,1500]},
] as const;
export const LEAGUE_RULES={includeRoster:true,capacity:40,minMembers:8,minActive:8,maxPairDealsPerDay:3,maxDealsPerDay:20};
export const WEEK_MS=7*86400000;
export function leagueWeek(now=Date.now()){const monday=Date.UTC(1970,0,5);return Math.floor((now-monday)/WEEK_MS)*WEEK_MS+monday;}
export type LeagueOutcome='promote'|'retain'|'demote'|'elite'|'provisional';
export type LeagueMember={uid:string;name:string;avatar:number;photoURL?:string;rank:number;earnings:number;wins:number;matches:number;outcome:LeagueOutcome};
export type LeagueFinish={season:number;tier:number;nextTier:number;rank:number;earnings:number;reward:number;outcome:LeagueOutcome;title:string;badge:string};
export type LeagueSnapshot={activePlayers?:number;season:number;ends:number;tier:number;ownTier:number;highest:number;group:string|null;groupNumber:number|null;ownGroup:string;ownRank:number;ownEarnings:number;provisional:boolean;zone:number;members:LeagueMember[];own:LeagueMember;distance:number;distanceLabel:string;groups:{id:string;number:number;count:number}[];finish:LeagueFinish|null;rules:typeof LEAGUE_RULES};

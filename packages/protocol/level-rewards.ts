import {xpForNextLevel} from './progression.ts';
export const MILESTONES=[
 {level:50,item:'frame:emerald-ace',name:'Emerald Ace',kind:'frame',symbol:'♠'},
 {level:100,item:'emote:cheeky-devil',name:'Cheeky Devil',kind:'emote',symbol:'😈'},
 {level:150,item:'emote:royal-applause',name:'Royal Applause',kind:'emote',symbol:'👏'},
 {level:200,item:'frame:royal-crown',name:'Royal Crown',kind:'frame',symbol:'♛'},
] as const;
export const rewardCoins=(level:number)=>Math.min(1000,100+Math.floor(level/5)*50)+(level%50===0?2500:0);
export function rewardXP(level:number){let xp=0;for(let i=1;i<level;i++)xp+=xpForNextLevel(i);return xp;}
export const rewardID=(uid:string,level:number)=>`level-reward:v1:${uid}:${level}`;
export type RewardState={level:number;xp:number;claimed:number[];owned:string[];equipped:string;wallet:number};

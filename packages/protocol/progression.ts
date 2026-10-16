/** XP is cumulative; each new level has a larger individual requirement. */
export function xpForNextLevel(currentLevel:number){if(currentLevel<=1)return 100;let required=120;for(let i=2;i<currentLevel;i++)required=Math.round(required*1.25/10)*10;return required;}
export function levelProgress(xp:number){
 let remaining=Math.floor(Math.min(Number.MAX_SAFE_INTEGER,Math.max(0,Number.isFinite(xp)?xp:0))),currentLevel=1,required=xpForNextLevel(1),floor=0;
 while(remaining>=required){remaining-=required;floor+=required;currentLevel++;required=xpForNextLevel(currentLevel);}
 return {level:currentLevel,current:remaining,required,percent:remaining/required*100,floor,next:floor+required};
}
export const level=(xp:number)=>levelProgress(xp).level;
export const BAND_UNLOCK_XP=Array.from({length:4},(_,i)=>xpForNextLevel(i+1)).reduce((a,b)=>a+b,0);
export const bandEligible=(xp:number)=>level(xp)>=5;
export type TutorialStatus='not-started'|'in-progress'|'completed'|'skipped';
// Existing account rows (0) predate this onboarding. New accounts explicitly begin at 4.
export const tutorialStatus=(code:number):TutorialStatus=>code===4?'not-started':code===2?'in-progress':code===3?'skipped':'completed';
export const tutorialCode={ 'not-started':4,'in-progress':2,completed:1,skipped:3 } as const;
export function tutorialTransition(old:number,next:TutorialStatus){return old===0||old===1||old===3?old:tutorialCode[next];}

export const level=(xp:number)=>1+Math.floor(Math.max(0,Number.isFinite(xp)?xp:0)/100);
export const bandEligible=(xp:number)=>level(xp)>=5;
export const BAND_UNLOCK_XP=400;
export type TutorialStatus='not-started'|'in-progress'|'completed'|'skipped';
// Existing account rows (0) predate this onboarding. New accounts explicitly begin at 4.
export const tutorialStatus=(code:number):TutorialStatus=>code===4?'not-started':code===2?'in-progress':code===3?'skipped':'completed';
export const tutorialCode={ 'not-started':4,'in-progress':2,completed:1,skipped:3 } as const;
export function tutorialTransition(old:number,next:TutorialStatus){return old===0||old===1||old===3?old:tutorialCode[next];}

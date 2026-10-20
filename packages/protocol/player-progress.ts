export type PlayerStats={totalGoldWon?:number;matches:number;wins:number;kotWins:number;goonKotWins:number;bestWinStreak:number;bestKotStreak:number;sarsCollected:number;winStreak:number;kotStreak:number};
export const emptyStats=():PlayerStats=>({matches:0,wins:0,kotWins:0,goonKotWins:0,bestWinStreak:0,bestKotStreak:0,sarsCollected:0,winStreak:0,kotStreak:0});
export function dealXP(won:boolean,outcome:string,firstWin=false){return 20+(won?30+(outcome==='kot'?20:outcome==='goon-kot'?40:0)+(firstWin?30:0):0);}
export function addDeal(stats:Partial<PlayerStats>,won:boolean,score:number,outcome:string):PlayerStats{
 const s={...emptyStats(),...stats},kot=won&&(outcome==='kot'||outcome==='goon-kot');
 s.matches++;s.wins+=+won;s.kotWins+=+(won&&outcome==='kot');s.goonKotWins+=+(won&&outcome==='goon-kot');s.sarsCollected+=score;
 s.winStreak=won?s.winStreak+1:0;s.kotStreak=kot?s.kotStreak+1:0;s.bestWinStreak=Math.max(s.bestWinStreak,s.winStreak);s.bestKotStreak=Math.max(s.bestKotStreak,s.kotStreak);return s;
}

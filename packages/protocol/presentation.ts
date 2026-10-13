/** Presentation pacing only; these constants never affect card legality or scores. */
export const DRAW_ROUND_MS=2400;
export const DEAL_PRESENTATION_MS=1600;
export function openingDrawMs(rounds:number){return Math.min(3,rounds)*DRAW_ROUND_MS;}

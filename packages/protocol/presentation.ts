/** Presentation pacing only; these constants never affect card legality or scores. */
export const WELCOME_MS=1300;
export const DRAW_ROUND_MS=3200;
export const DEAL_PRESENTATION_MS=3000;
export function openingDrawMs(rounds:number){return WELCOME_MS+Math.min(3,rounds)*DRAW_ROUND_MS;}

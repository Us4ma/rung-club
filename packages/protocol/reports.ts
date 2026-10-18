export const REPORT_REASONS={cheating:'Suspected cheating or unfair play',harassment:'Harassment or abusive behaviour','offensive-profile':'Offensive name or profile',disruption:'Deliberately disrupting the game',other:'Other concern'} as const;
export type ReportReason=keyof typeof REPORT_REASONS;
export const REPORT_MAX_WORDS=100,REPORT_MAX_CHARS=750;

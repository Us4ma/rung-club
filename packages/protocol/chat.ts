export const CHAT_MAX_CHARS=500;
export type ChatMessage={seq:number;id:string;sender:string;recipient:string;text:string;created:number};
export type ChatPage={messages:ChatMessage[];hasMore:boolean;serverNow:number};

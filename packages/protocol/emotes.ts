/** Shared allowlist for table reactions; no free-form chat. */
export const TABLE_REACTIONS=[
 {text:'Well played',asset:'applause'},
 {text:'Good luck',asset:'thumbs_up'},
 {text:'Nice Sar',asset:'amazed'},
 {text:'Haha!',asset:'laughing'},
 {text:'Thinking…',asset:'thinking'},
 {text:'Love it',asset:'love'},
];
export function isTableReaction(text:unknown):text is string{return typeof text==='string'&&TABLE_REACTIONS.some(r=>r.text===text);}

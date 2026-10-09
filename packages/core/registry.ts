// Future games implement this contract; platform accounts, ledger and seats are game-independent.
export interface GameAdapter<S,V,A>{id:string;version:string;create(options:unknown):S;view(state:S,seat:number):V;apply(state:S,seat:number,action:A):S;isFinished(state:S):boolean;}
export type GameDescriptor={id:string,title:string,players:number,presets:string[]};
export const GAMES:GameDescriptor[]=[{id:'rung',title:'Pakistani Rung',players:4,presets:['double-sar-v1-provisional','band-double-sar-v1-provisional']}];

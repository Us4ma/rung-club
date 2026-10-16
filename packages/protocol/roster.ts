import type {View} from '../core/index.ts';
import {choose,chooseTrump,type Skill} from '../ai/index.ts';
export const ROSTER_NAMES=['Hamza','Uzair','Zain','Ayesha','Fatima','Ali','Bilal','Hassan','Usman','Sara','Aarav','Arjun','Kabir','Rohan','Aditya','Rahul','Priya','Ananya','Meera','Isha'] as const;
export type Style='balanced'|'conservative'|'attacking'|'partnership';
export const ROSTER=ROSTER_NAMES.map((name,i)=>({id:'roster:'+name.toLowerCase(),name,avatar:1+i%6,skill:(i%5===0?'intermediate':'advanced') as Skill,style:(['balanced','conservative','attacking','partnership'] as Style[])[i%4]}));
export const rosterById=(id:string|null|undefined)=>ROSTER.find(p=>p.id===id);
export function chooseRoster(v:View,seat:number,id:string){const p=rosterById(id);if(v.phase==='calling')return chooseTrump(v);return choose(v,seat,p?.skill??'advanced',Math.random,p?.style??'balanced');}

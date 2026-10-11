import {it,expect} from 'vitest';
import {create,call,deck,legal,play,reveal,view,seeded,type State,type Play} from '../packages/core/index.ts';
import {choose} from '../packages/ai/index.ts';
const c=(id:string)=>deck().find(c=>c.id===id)!;
const p=(seat:number,id:string,trump=false):Play=>({seat,card:c(id),effective:c(id).rank,trump,bhaag:false});
function fixture(){const s=call(create('open',seeded(7)),0,'H',seeded(8));s.turn=1;s.hands[1]=['H14','H2','D9','C4'].map(c);return s;}
const ids=(s:State)=>legal(s,1).map(c=>c.id);
it('default allows every void card before and after opponent or partner cuts',()=>{for(const trick of [[],[p(0,'S13')],[p(0,'S13'),p(2,'H6',true)],[p(0,'S13'),p(3,'H6',true)]]){const s=fixture();s.trick=trick;expect(ids(s)).toEqual(['H14','H2','D9','C4']);}});
it('voluntary superior restriction never removes nontrump discards',()=>{const s=fixture();s.policy.superior='always';s.trick=[p(0,'S13'),p(2,'H6',true)];expect(ids(s)).toEqual(['H14','D9','C4']);expect(()=>play(s,1,'D9')).not.toThrow();expect(()=>play(s,1,'H2')).toThrow();});
it('original led suit stays mandatory even after a cut',()=>{const s=fixture();s.hands[1].push(c('S2'));s.trick=[p(0,'S13'),p(2,'H6',true)];expect(ids(s)).toEqual(['S2']);});
it('trump-led follows suit; default does not require superior trump',()=>{const s=fixture();s.trick=[p(0,'H6',true)];expect(ids(s)).toEqual(['H14','H2']);});
it('void with no trump can discard and Band requester must trump after reveal',()=>{const s=fixture();s.trick=[p(0,'S13')];s.hands[1]=['D9','C4'].map(c);expect(ids(s)).toEqual(['D9','C4']);s.mode='band';s.revealed=false;s.hands[1].push(c('H2'));const n=reveal(s,1);expect(ids(n)).toEqual(['H2']);expect(n.trick[0].trump).toBe(false);});
it('redacted human and all bot profiles share authoritative options',()=>{const s=fixture();s.trick=[p(0,'S13'),p(2,'H6',true)];const v=view(s,1);expect(v.legal).toEqual(ids(s));for(const skill of ['beginner','intermediate','advanced'] as const)for(let i=1;i<20;i++)expect(ids(s)).toContain(choose(v,1,skill,seeded(i)));});

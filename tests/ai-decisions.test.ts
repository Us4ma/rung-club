import {it,expect} from 'vitest';
import {choose,chooseTrump} from '../packages/ai/index.ts';
import {create,view,deck,call,play,reveal,seeded,invariants,type Card,type Play} from '../packages/core/index.ts';
const card=(id:string)=>deck().find(c=>c.id===id)!;
const played=(seat:number,id:string):Play=>({seat,card:card(id),effective:card(id).rank,trump:false,bhaag:false});
function position(hand:string[],trick:Play[]=[]){const s=create();s.phase='playing';s.turn=0;s.trump='H';s.revealed=true;s.hands[0]=hand.map(card);s.trick=trick;return view(s,0);}
it('saves a high card when partner has already won the completed trick',()=>{
 const v=position(['C2','C14'],[played(3,'C3'),played(2,'C13'),played(1,'C4')]);expect(choose(v,0,'advanced')).toBe('C2');
});
it('uses the cheapest winning card when last to act',()=>{
 const v=position(['C2','C12','C14'],[played(3,'C10'),played(2,'C3'),played(1,'C4')]);expect(choose(v,0,'advanced')).toBe('C12');
});
it('leads an established non-trump winner to collect the pile',()=>{
 const v=position(['C13','D3','H14']);v.senior=0;v.streakSeat=0;v.streak=1;v.pile=4;v.history=Array.from({length:4},()=>[]);v.history[0]=[played(1,'C14')];expect(choose(v,0,'advanced')).toBe('C13');
});
it('completes seeded open and band deals legally without hidden hands',()=>{
 for(let seed=1;seed<=40;seed++){const rng=seeded(seed);let s=create(seed%2?'open':'band',rng);let moves=0;
 while(s.phase!=='finished'&&moves++<200){const v=view(s,s.turn);expect('hands' in v).toBe(false);s=s.phase==='calling'?call(s,s.turn,s.mode==='band'?v.hand[0].id:'H',rng):v.canReveal?reveal(s,s.turn):play(s,s.turn,choose(v,s.turn,'advanced'));invariants(s);}
 expect(s.phase).toBe('finished');expect(s.scores[0]+s.scores[1]).toBe(13);
 }
});

it('chooses a long trump suit over a lone ace',()=>{expect(chooseTrump(position(['C14','H2','H3','H4','D10']))).toBe('H');});

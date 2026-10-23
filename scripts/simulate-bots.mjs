import {create,call,play,reveal,view,seeded,invariants,winning} from '../packages/core/index.ts';
import {choose,chooseTrump} from '../packages/ai/index.ts';
const styles=['balanced','conservative','attacking','partnership'];
const dealCount=Math.max(1,Math.min(10000,Number(process.argv[2])||500));
let metrics={deals:0,moves:0,partnerOvertakes:0,deadAceLeads:0,avoidableDeadAceLeads:0,kots:0,goonKots:0};let examples=[];
for(let i=0;i<dealCount;i++){
 const rng=seeded(7300+i);let s=create(i%2?'band':'open',rng,undefined,i%4),steps=0;
 while(s.phase!=='finished'){
  if(++steps>250)throw Error('Deal stalled');
  if(s.phase==='calling'){s=call(s,s.caller,chooseTrump(view(s,s.caller)),rng);continue;}
  const seat=s.turn;let v=view(s,seat);
  if(v.canReveal){s=reveal(s,seat);v=view(s,seat);}
  const id=choose(v,seat,'advanced',rng,styles[seat]);const c=v.hand.find(c=>c.id===id),best=winning(v.trick);
  if(!v.trick.length&&v.lastAce&&v.senior===seat&&c.rank===14){metrics.deadAceLeads++;if(v.legal.some(id=>v.hand.find(c=>c.id===id).rank!==14))metrics.avoidableDeadAceLeads++;}
  if(best&&best.seat%2===seat%2&&v.trick.length===3){
   const selected={seat,card:c,effective:c.rank,trump:v.revealed&&c.suit===v.trump,bhaag:false};
   const win=winning([...v.trick,selected]);
   const canDuck=v.legal.some(id=>{const c=v.hand.find(c=>c.id===id);return winning([...v.trick,{...selected,card:c,effective:c.rank,trump:v.revealed&&c.suit===v.trump}]).seat===best.seat;});
   if(win.seat===seat&&canDuck){metrics.partnerOvertakes++;if(examples.length<6)examples.push({deal:i,sar:v.history.length+1,hand:v.hand.map(c=>c.id),trick:v.trick.map(p=>`${p.seat}:${p.card.id}`),chosen:id,streak:v.streakSeat});}
  }
  s=play(s,seat,id);invariants(s);metrics.moves++;
 }
 metrics.deals++;if(s.result==='Kot')metrics.kots++;if(s.result==='Goon Kot')metrics.goonKots++;
}
console.log(JSON.stringify({metrics,examples},null,2));

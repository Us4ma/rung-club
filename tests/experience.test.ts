import {describe,it,expect} from 'vitest';
import {deck,seeded,view,call,play,invariants,legal,reveal} from '../packages/core/index.ts';
import {createMatch,openingDraw} from '../packages/core/opening.ts';
import {guidedDeal,guidedCards,scriptedCard} from '../packages/core/tutorial.ts';
import {Session} from '../packages/protocol/index.ts';
import {clockFor,expireTurn,automaticCommand} from '../packages/protocol/timing.ts';
import {bandEligible,tutorialStatus,tutorialTransition} from '../packages/protocol/progression.ts';
const cards=(ids:string[])=>ids.map(id=>deck().find(c=>c.id===id)!);
describe('authoritative highest rank draw',()=>{
 it('unique Ace wins, with no suit superiority',()=>{expect(openingDraw(seeded(1),cards(['C14','S13','H12','D2'])).winner).toBe(0);});
 it.each([
  [['C13','S13','H8','D4','C9','SQ'],1],
  [['C13','S13','H13','D4','C9','S10','H14'],2],
  [['C13','S13','H13','D13','C9','S10','H11','D12'],3]
 ])('redraws only tied seats: %j',(ids,winner)=>{const normalized=(ids as string[]).map(id=>id==='SQ'?'S12':id);const d=openingDraw(seeded(1),cards(normalized));expect(d.winner).toBe(winner);expect(d.rounds).toHaveLength(2);expect(d.rounds[1].cards.map(p=>p.seat)).toEqual(d.rounds[0].eligible);});
 it('eliminated players never reenter and depleted pools replenish',()=>{const d=openingDraw(seeded(5),cards(['C13','S13','H8','D4','C9','S9']));expect(d.rounds[2].cards.map(p=>p.seat)).toEqual([0,1]);expect(d.rounds.length).toBeLessThanOrEqual(65);});
 it('bounds pathological ties without assigning suit preference',()=>{const repeated=Array.from({length:256},()=>cards(['C14'])[0]);const d=openingDraw(seeded(8),repeated);expect(d.boundedFallback).toBe(true);expect(d.rounds).toHaveLength(65);});
 it('seeded opening and complete 52-card deal are reproducible',()=>{for(let seed=1;seed<=50;seed++){const a=createMatch('open',seeded(seed)),b=createMatch('open',seeded(seed));expect(a.opening).toEqual(b.opening);expect(a.hands).toEqual(b.hands);expect(a.turn).toBe(a.opening!.winner);invariants(a);expect(a.hands.map(h=>h.length)).toEqual([5,5,5,5]);expect(a.stock.map(h=>h.length)).toEqual([8,8,8,8]);}});
});
describe('guided conserved match',()=>{
 it('plays five legal Sars, cuts with trump and collects only on the fifth',()=>{let s=guidedDeal();invariants(s);s=call(s,0,'H');expect(s.redeals).toBe(0);expect(s.hands.map(h=>h.length)).toEqual([13,13,13,13]);let count=0;while(s.history.length<5&&count++<30){const v=view(s,s.turn),card=s.turn===0?guidedCards[s.history.length]:scriptedCard(v);expect(legal(s,s.turn).map(c=>c.id)).toContain(card);s=play(s,s.turn,card);invariants(s);if(s.history.length<5)expect(s.scores).toEqual([0,0]);}expect(s.winners).toEqual([0,3,0,0,0]);expect(s.scores).toEqual([5,0]);expect(s.pile).toBe(0);expect(s.history[2].find(p=>p.seat===0)?.trump).toBe(true);});
});
describe('persisted clocks and legal expiry',()=>{
 it('starts at 20 seconds, never before ready, stable on reconnect',()=>{const s=createMatch('open',seeded(8));expect(clockFor(s,false,undefined,1000)).toBeUndefined();const c=clockFor(s,true,undefined,1000)!;expect(c.deadline).toBe(21000);expect(clockFor(s,true,c,15000)).toBe(c);expect(clockFor(s,true,undefined,1000,true)?.duration).toBe(700);});
 it('calling timeout, duplicate and late command rejected without mutation',()=>{const session=new Session(guidedDeal()),c=clockFor(session.state,true,undefined,1000)!;expect(expireTurn(session,c,20999)).toBe(false);expect(expireTurn(session,c,21000)).toBe(true);expect(session.state.phase).toBe('playing');const revision=session.state.revision;expect(expireTurn(session,c,22000)).toBe(false);expect(()=>session.apply(0,{matchId:session.state.matchId,id:'late',seq:1,revision:0,type:'call',card:'S'})).toThrow();expect(session.state.revision).toBe(revision);});
 it('human before expiry invalidates old clock; complete autoplay stays legal',()=>{const session=new Session(guidedDeal()),old=clockFor(session.state,true,undefined,0)!;session.apply(0,{matchId:session.state.matchId,id:'human',seq:1,revision:0,type:'call',card:'H'});expect(expireTurn(session,old,20000)).toBe(false);let now=0;while(session.state.phase!=='finished'){const c=clockFor(session.state,true,undefined,now)!;now=c.deadline;expect(expireTurn(session,c,now)).toBe(true);invariants(session.state);}expect(clockFor(session.state,true,undefined,now)).toBeUndefined();expect(expireTurn(session,old,now)).toBe(false);});
 it('Band timeout sees only redacted view and conserves indicator',()=>{for(let seed=1;seed<12;seed++){const session=new Session(createMatch('band',seeded(seed)));while(session.state.phase!=='finished'){const seat=session.state.turn,c=automaticCommand(session);session.apply(seat,c);invariants(session.state);const v=view(session.state,(seat+1)%4);expect('hands' in v).toBe(false);if(!v.revealed&&v.caller!==(seat+1)%4){expect(v.trump).toBeNull();expect(v.indicator).toBeNull();}}}});
});
describe('progression and legacy onboarding',()=>{
 it.each([0,99,100,299,399])('rejects XP %s',xp=>expect(bandEligible(xp)).toBe(false));
 it.each([400,499,500,1000])('allows XP %s',xp=>expect(bandEligible(xp)).toBe(true));
 it('new rows start explicitly; legacy rows and terminal outcomes never restart',()=>{expect(tutorialStatus(0)).toBe('completed');expect(tutorialStatus(4)).toBe('not-started');expect(tutorialStatus(2)).toBe('in-progress');expect(tutorialTransition(1,'in-progress')).toBe(1);expect(tutorialTransition(3,'not-started')).toBe(3);expect(tutorialTransition(4,'skipped')).toBe(3);});
});
import {advancedLesson} from '../packages/core/tutorial.ts';
it('optional lessons resolve real Ace, Bhaag, reveal and Kot examples',()=>{let ace=advancedLesson('Ace-on-Ace');invariants(ace);ace=play(ace,0,'D14');expect(ace.trick[0].effective).toBe(2);let bhaag=advancedLesson('Bhaag');bhaag=play(bhaag,0,'C2',true);expect(bhaag.trick[0].bhaag).toBe(true);let band=advancedLesson('Band Rung reveal');const before=band.trick.map(p=>p.trump);band=reveal(band,0);expect(band.trick.map(p=>p.trump)).toEqual(before);expect(band.hands[0].some(c=>c.id==='H14')).toBe(true);invariants(band);const kot=advancedLesson('Kot');expect(kot.phase).toBe('finished');expect(kot.scores).toContain(13);invariants(kot);});
it('public seat counts show five opening cards, then thirteen after calling',()=>{const s=guidedDeal();for(let seat=0;seat<4;seat++)expect(view(s,seat).counts).toEqual([5,5,5,5]);const ready=call(s,0,'H');expect(view(ready,0).counts).toEqual([13,13,13,13]);});

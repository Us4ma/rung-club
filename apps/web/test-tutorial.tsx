import React,{useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {invariants,type State,type View} from '../../packages/core/index.ts';
import {firstDealCard} from '../../packages/core/first-deal.ts';
import './test-tutorial.css';
const SAVE='rung:test-tutorial:v1';
export function saveTestTutorial(game:State,stake:number){try{sessionStorage.setItem(SAVE,JSON.stringify({...game,practiceStake:stake}));}catch{}}
export function restoreTestTutorial():(State & {practiceStake?:number})|null{try{const s=JSON.parse(sessionStorage.getItem(SAVE)||'null');if(!s||s.mode!=='open'||s.caller!==0||!s.matchId)return null;invariants(s);return s;}catch{return null;}}
export function clearTestTutorial(){sessionStorage.removeItem(SAVE);}
const host=()=>document.querySelector('.app')||document.body;
export function TestIntro({match,onDone,onMessage,onFocus}:{match:string;onDone:()=>void;onMessage:(message:string)=>void;onFocus:(focus:string)=>void}){
 const [step,setStep]=useState(0),[feedback,setFeedback]=useState('');
 const messages=["Welcome to Rung! It's a 2v2 card game. You and your partner play together.",'Hamza and Zain are your opponents. Each player plays one card per Saar (trick).','Within a suit, Ace ranks highest and Two ranks lowest.','We play with 52 cards in four suits: ♠ Spades, ♥ Hearts, ♦ Diamonds and ♣ Clubs.','One suit becomes Rung. Even its Two can beat an Ace of another suit.','First, one comparison card each. The highest card earns the right to choose Rung (the trump suit).'];
 useEffect(()=>{onMessage(feedback||messages[step]);onFocus(step===0?'team':step===1?'opponents':(step===2||step===4)?'ranking':'all');},[step,feedback]);
 function next(){setFeedback('');if(step===5){sessionStorage.setItem('test-intro:'+match,'done');onDone();}else setStep(n=>n+1);}
 return createPortal(<div className="test-lesson-dock" role="group" aria-label="Test tutorial introduction">{step===2?<><div className="test-rank-strip" aria-label="Card ranks, lowest to highest">2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → J → Q → K → A</div><span>Which card ranks higher?</span><button onClick={()=>setFeedback('A king is strong, but an ace ranks higher. Try the ace.')}><img src="/art/house/cards/KS.webp" alt="King of spades"/>K♠</button><button onClick={next}><img src="/art/house/cards/AS.webp" alt="Ace of spades"/>A♠</button></>:step===4?<><div className="test-rank-strip">Example · Spades are Rung</div><span>Hearts were led and you have no Hearts. Which card wins?</span><button onClick={next}><img src="/art/house/cards/2S.webp" alt="Two of spades"/>2♠</button><button onClick={()=>setFeedback('Spades are Rung here, so 2♠ beats A♥.')}><img src="/art/house/cards/AH.webp" alt="Ace of hearts"/>A♥</button></>:<button className="gold" onClick={next}>{step===5?'Draw the cards':'Got it'}</button>}</div>,host());
}
type Lesson={id:string;text:string;choices?:{label:string;correct:boolean;feedback?:string}[]};
export function useTestTutorial(enabled:boolean,v:View|null,presenting:boolean,onExit:()=>void){
 const [done,setDone]=useState<string[]>([]),[feedback,setFeedback]=useState(''),[hint,setHint]=useState(false);
 const [spadesHint,setSpadesHint]=useState('');
 const match=v?.matchId||'',h=v?.history.length??0,turn=v?.turn===0,trick=v?.trick.length??0;
 useEffect(()=>{setFeedback('');setHint(false);},[v?.revision]);
 useEffect(()=>{try{setDone(JSON.parse(sessionStorage.getItem('test-lessons:'+match)||'[]'));}catch{setDone([]);}setFeedback('');setHint(false);},[match,enabled]);
 function complete(id:string){setDone(old=>{const next=[...old,id];sessionStorage.setItem('test-lessons:'+match,JSON.stringify(next));return next;});setFeedback('');setHint(false);}
 const lessons:Lesson[]=[];
 const add=(id:string,text:string,choices?:Lesson['choices'])=>{if(!done.includes(id))lessons.push({id,text,choices});};
 if(enabled&&v&&!presenting){
 if(v.phase==='calling'){
 add('five','These are your first five cards. Choose a suit to make it Rung (trump).');
 add('strong-spades','You have A♠ and K♠. Which suit gives you two strong cards?',[{label:'♦ Diamonds',correct:false,feedback:'K♦ is strong, but you have both A♠ and K♠. Look at Spades.'},{label:'♠ Spades',correct:true}]);
 }else if(v.phase==='finished'){
 add('kot','Kot! Your team collected all 13 Sars!');
 add('ordinary','Most deals end with ordinary wins, like 7–6 or 8–5. You do not need Kot to win.');
 add('help','Keep practising! You can replay lessons in Settings → Help & Matchmaking.');
 }else{
 if(h===0&&trick===0)add('rung-power','Spades are Rung! Even 2♠ can beat an ace of another suit when you cannot follow suit.');
 if(h===0&&turn&&trick===0){
 add('opening-read','The first Saar gives you clues. Watch who spends a high card and who plays low.');
 add('opening-heart','The 10♥ is your only Heart. Play it now and save your stronger Diamonds and Spades for later.');
 }
 if(h===0&&trick===1)add('follow','Hearts started this Saar. If you have a Heart, what must you play?',[{label:'Follow Hearts',correct:true},{label:'Any suit',correct:false,feedback:'When you have the led suit, you must follow it. Other suits are allowed when you have none.'}]);
 if(h===1&&trick===0)add('uzair','Uzair’s Q♥ was highest. He won this Saar and is Senior: the winner who leads next.');
 if(h===1&&trick===0)add('opening-pile','Winning a Saar gives you the next lead. This Saar goes into the shared pile. Neither team can collect it before Saar 5.');
 if(h===1&&turn){add('void','You played your only Heart in Saar 1. Hearts were led again, so you can discard or cut with Rung. Must you cut?',[{label:'Yes, always',correct:false,feedback:'No. Cutting with Rung is optional when you cannot follow suit.'},{label:'No, I may discard',correct:true}]);add('discard','J♣ is a legal discard (badd rungi). It cannot beat Hearts here, but it saves your Rung.');}
 if(h===2&&turn){
 add('cut-save','Hamza led A♥ and you have no Hearts. A discard saves your Rung for later.');
 add('cut-risk','If Hamza keeps the lead, he can build toward a run and claim the pile. Cutting now can take away his lead.');
 add('cut','Which card can cut Hamza’s A♥ while saving your stronger Rung?',[{label:'K♦',correct:false,feedback:"K♦ is a legal badd rungi. It saves your Spades, but Hamza’s A♥ stays ahead. Try cutting with Rung to take the lead."},{label:'2♠',correct:true}]);
 }
 if(h===3&&trick===0){add('cut-result','Correct! Your 2♠ beat A♥ because Spades are Rung. You won and are Senior now.');add('control','Being Senior is powerful. You choose which suit starts next. Why does this help?',[{label:'I control the led suit',correct:true},{label:'My cards all become Rung',correct:false,feedback:'Only Spades are Rung. Being Senior lets you choose the suit everyone must follow.'}]);}
 if(h===4&&trick===0){add('middle','The first chance to collect is Saar 5. If every pile is claimed at the first chance, the 13 Sars split into 5, then 2, 2, 2 and 2.');add('double','You won Saar 4. Who must win Saar 5 to complete your consecutive-win streak?',[{label:'Me again',correct:true},{label:'Either teammate',correct:false,feedback:'The same player must win consecutively. One win by each teammate does not complete Double Saar.'}]);}
 const collection=v.collections?.at(-1);
 if(collection?.sar===h){add('collect:'+h,h===5?'You won twice in a row! Your team collected all 5 Sars. Your collection streak now resets.':'Your team collected '+collection.count+' more Sars. The collection streak resets.');if(h===5)add('defend','If a Kot looks unlikely, focus on claiming piles for your team. Miss a chance to collect and the unclaimed Sars carry forward.');if(h===5)add('eligible','Aces and Rung help you become Senior. But our rules require a non-Ace, non-Rung winning lead to complete Bhaag (pile collection).');}
 if(h===8&&trick===0)add('higher','Hamza’s Q♠ beat your J♠: both are Rung, so the higher rank wins. He leads next.');
 }
 }
 const lesson=lessons[0];
 const [rejectedVoidAnswer,setRejectedVoidAnswer]=useState(false);
 useEffect(()=>{setRejectedVoidAnswer(false);},[match,lesson?.id]);
 const tips=['Lead 10♥. Anyone who has a Heart must follow suit.','Play J♣ as a legal discard. Hearts were led, so this Club will not win.','Cut with 2♠. Your lowest Rung beats A♥ and saves your higher Spades for later.','Lead A♦. Controlling Senior helps you prepare to collect the opening pile.','Lead K♦. A winning non-Ace, non-Rung lead can complete your Double Saar.','Lead 9♠ to draw Rung out of opponents’ hands. Saving strong cards can also help.','Lead 10♠. You are removing more Rung while preserving your ace.','Lead J♠ and compare it with the other Rung cards.','Hamza led 5♣. You have no Clubs: cutting is optional. Use K♠ to stop his Bhaag.','Lead Q♦. Another qualifying win can collect this fresh pile.','Lead 10♦. You choose Diamonds and save your last Rung, A♠.','Lead J♦. Keep your useful A♠ for the final Saar.','The final Saar’s winner collects whatever remains. Lead your last Rung, A♠.'];
 const text=feedback||lesson?.text||(v?.phase==='calling'?'Two strong Spades make a good Rung choice. Choose Spades, then set your practice stake.':v?.phase==='finished'?'Lesson complete. These practice coins do not change your wallet.':turn?tips[h]:'Watch the led suit and compare the cards played.');
 const paused=!!lesson;
 function alternative(){const id=firstDealCard(v!),name=({S:'spades',H:'hearts',D:'diamonds',C:'clubs'}[id[0] as 'S'])||'';setFeedback('That card is legal. This example uses '+id.slice(1)+' of '+name+' to demonstrate the lesson. Use Hint to find it.');}
 const finished=enabled&&v?.phase==='finished'&&!lesson;
 const focus=lesson?.id==='rung-power'?'rung-power':lesson?.id==='opening-pile'||lesson?.id==='middle'||lesson?.id==='double'||lesson?.id.startsWith('collect:')?'pile':lesson?.id==='uzair'?'partner':h===1&&turn?'discard':v?.phase==='calling'&&spadesHint===match?'spades':v?.phase==='calling'&&(lesson?.id==='five'||lesson?.id==='strong-spades')?'opening-hand':h===0&&trick>0?'led':'';
 const hintText:Record<string,string>={
 'opening-read':'Notice which high Hearts come out. Those cards cannot win a later Saar.',
 'opening-heart':'Look for 10♥, your only Heart. Your Diamonds and Spades can stay in your hand for later.',
 five:'A suit is a card family: Spades, Hearts, Diamonds or Clubs. Look at your A♠ and K♠: two strong cards in one suit.',
 'strong-spades':'Look at A♠ and K♠. Both belong to Spades, so that suit gives you two high cards.',
 follow:'Look at the first card in the middle: it is a Heart. Players with Hearts must match that suit.',
 void:'With no Hearts, a non-Rung discard is legal too. You do not have to cut.',
 discard:'Compare J♣ with the Hearts in the middle. It is legal, but a Club cannot beat a Heart here.',
 'cut-save':'A Diamond is a legal discard here. It keeps your Spades for later.',
 'cut-risk':'Think about who gets to lead the next Saar if Hamza’s Ace holds.',
 cut:'Use 2♠ to take the lead. Even the lowest Spade beats A♥ because Spades are Rung. Save your higher Spades for later.',
 control:'Senior chooses the first card and therefore the suit others must follow. The Rung suit does not change.',
 uzair:'Look for the S badge on Uzair. It means he is Senior and leads next. The Saar is still in the shared pile.',
 'opening-pile':'The pile shows one Saar. Both teams still have zero collected Sars.',
 defend:'Claiming a pile adds those Sars to your score and keeps them out of your opponents’ reach.',
 middle:'The pile holds the four completed Sars. It has not been awarded to either team yet.',
 double:'Your own win in Saar 4 must be followed by another win by you. Your partner winning does not extend your streak.',
 eligible:'Use Aces and Rung to gain control. To complete Bhaag, lead a different suit with a card below an Ace.',
 higher:'Compare Q♠ and J♠. Both are Spades, so the Queen is higher.',
 kot:'Your team collected every Sar in this example. That is Kot.',
 ordinary:'In an ordinary deal, collecting seven Sars is enough to finish ahead of six.',
 help:'You can leave now and return through Settings → Help & Matchmaking.',
 };
 function showHint(){if(v?.phase==='calling')setSpadesHint(match);setHint(true);setFeedback(lesson?(hintText[lesson.id]||(lesson.id.startsWith('collect:')?'Look at your team’s score. The Sars just collected are now counted there.':lesson.text)):tips[h]);}
 const ui=enabled&&!presenting?<>
 {(h===4||h===5)&&<div className="test-lesson-progress" role="status"><span className="test-streak"><i className={h===4||!done.includes('collect:5')?'active':''}/><i className={h===5&&!done.includes('collect:5')?'active':''}/>{h===4?'First consecutive win':done.includes('collect:5')?'5 collected · streak reset':'Double Saar · 5 collected'}</span></div>}
 {lesson?<div className="test-lesson-dock" role="group" aria-label="Test tutorial checkpoint">{lesson.choices?lesson.choices.filter(c=>lesson.id!=='void'||!rejectedVoidAnswer||c.correct).map(c=><button key={c.label} onClick={()=>{if(c.correct){complete(lesson.id);return;}if(lesson.id==='void')setRejectedVoidAnswer(true);setFeedback(c.feedback||'Try again.');}}>{c.label}</button>):<button className="gold" onClick={()=>complete(lesson.id)}>Continue</button>}<button aria-pressed={hint} onClick={showHint}>{hint?'Hint shown above':'Hint'}</button></div>:finished?<div className="test-lesson-dock"><button className="gold" onClick={onExit}>Back to lobby</button></div>:null}
 </>:null;
 return {message:text,paused,ui,focus,showHint,reveal:!paused&&(hint||h===0)||done.includes('cut')&&h===2,alternative};
}

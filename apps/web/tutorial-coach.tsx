import {createPortal} from 'react-dom';
import React,{useEffect,useState} from 'react';
export const TUTORIAL_EXTRA_MS=1000;
export const TUTORIAL_INTRO=[
 'Welcome to the table.',
 'Rung is played by four players, in two teams.',
 'This is your team. Your partner sits directly opposite you.',
 'The players on your left and right are your opponents.',
 'Each player plays one card. Together, those four cards make one Sar.',
 'Your team’s goal is to collect Sars. I’ll explain how as we play.',
 'First, I’ll draw one card for each player. The highest card becomes Senior and chooses Rung.',
];
export function TutorialContinue({lesson,onNext,label='Continue',children}:{lesson:string;onNext:()=>void;label?:string;children?:React.ReactNode}){
 const [ready,setReady]=useState(false),[repeat,setRepeat]=useState(0);
 useEffect(()=>{setReady(false);const timer=setTimeout(()=>setReady(true),1000);return()=>clearTimeout(timer);},[lesson,repeat]);
 return createPortal(<div className="tutorial-reading-controls" role="group" aria-label="Tutorial controls">{children}<button type="button" onClick={()=>{document.querySelector('.dealer-speech strong')?.scrollTo?.({top:0});setRepeat(n=>n+1);}}>Read again</button><button type="button" className="gold" disabled={!ready} onClick={onNext}>{label}</button></div>,document.querySelector('.app')||document.body);
}
export function TutorialCutCheck({onCorrect}:{onCorrect:()=>void}){const [wrong,setWrong]=useState(false);return createPortal(<div className="tutorial-reading-controls tutorial-check" role="group" aria-label="Choose a card to cut"><p>{wrong?'Diamonds are not Rung. Spades are Rung and can beat the ace of hearts.':'Which card can beat the ace of hearts when you have no hearts?'}</p><button type="button" onClick={()=>setWrong(true)}>K♦ · diamonds</button><button type="button" onClick={onCorrect}>2♠ · Rung</button></div>,document.querySelector('.app')||document.body);}

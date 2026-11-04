import {openingDraw} from './opening.ts';
import {create,deck,type State,type View} from './index.ts';

// Rows are Sars and columns are seats. The engine still decides legality and winners.
const plays = [
 ['H10','H2','H12','H11'],
 ['C11','H13','H4','H3'],
 ['S2','H14','H5','H6'],
 ['D14','D2','D3','D4'],
 ['D13','D5','D6','D7'],
 ['S9','S3','S4','S5'],
 ['S10','S6','S8','S7'],
 ['S11','S12','C3','C4'],
 ['S13','C5','C6','C7'],
 ['D12','D8','D9','C2'],
 ['D10','C13','C12','C14'],
 ['D11','C9','C10','H7'],
 ['S14','H8','H9','C8'],
];
export function firstDeal():State {
 const state=create('open');
 const cards=new Map(deck().map(card=>[card.id,card]));
 state.opening=openingDraw(undefined,['S14','H12','D13','C2'].map(id=>cards.get(id)!));
 const opening=['S14','H10','D13','C11','S13'];
 const hands=state.hands.map((_,seat)=>plays.map(row=>row[seat]));
 hands[0]=[...opening,...hands[0].filter(id=>!opening.includes(id))];
 state.hands=hands.map(hand=>hand.slice(0,5).map(id=>cards.get(id)!));
 state.stock=hands.map(hand=>hand.slice(5).map(id=>cards.get(id)!));
 return state;
}
export function firstDealCard(view:View){
 return plays[view.history.length]?.[view.turn];
}

/** Felt-relative chip lanes. Side stacks sit inside the card-back/portrait lanes. */
export function chipBankPositions(width:number){
 const narrow=width<600;
 return [{x:65,y:79},{x:narrow?73:82,y:65},{x:narrow?32:64,y:22},{x:narrow?27:18,y:65}];
}

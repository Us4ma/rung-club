import {it,expect} from 'vitest';
import {chipBankPositions} from '../apps/web/chip-layout.ts';
it('keeps complete chip labels inside the oval and clear of mobile side card backs',()=>{
 for(const [width,height] of [[280,170],[320,173],[352,198],[390,220],[540,240],[700,180],[1120,270]]){
  const positions=chipBankPositions(width),halfWidth=width<600?26:37,halfHeight=14;
  for(const p of positions){for(const dx of [-halfWidth,halfWidth])for(const dy of [-halfHeight,halfHeight]){
   const x=p.x/100*width+dx,y=p.y/100*height+dy;
   expect(((x-width/2)/(width/2))**2+((y-height/2)/(height/2))**2).toBeLessThan(.96);
  }}
  // Mobile face-down hands occupy the outer 17% below the side portraits.
  if(width<600){expect(positions[3].x/100*width-halfWidth).toBeGreaterThan(width*.17);expect(positions[1].x/100*width+halfWidth).toBeLessThan(width*.83);}
 }
});

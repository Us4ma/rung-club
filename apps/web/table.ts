import Phaser from 'phaser';
// Restrained highlight overlay. The responsive table artwork is a CSS background,
// avoiding another GPU-sized texture and keeping state/labels accessible in DOM.
export function mountTable(parent:HTMLElement){class Felt extends Phaser.Scene{create(){const g=this.add.graphics();const draw=()=>{const {width:w,height:h}=this.scale;g.clear();g.lineStyle(1,0xf1c97f,.3);g.strokeRoundedRect(w*.08,h*.08,w*.84,h*.84,Math.min(w,h)/5);};draw();this.scale.on('resize',draw);}}return new Phaser.Game({type:Phaser.CANVAS,parent,width:parent.clientWidth,height:parent.clientHeight,transparent:true,scale:{mode:Phaser.Scale.RESIZE},scene:Felt,fps:{target:30,forceSetTimeOut:true},audio:{noAudio:true},banner:false});}

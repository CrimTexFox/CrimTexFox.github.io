import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import * as wheelMath from '../dist/wheel-math.js';

// Exercise the real wheel without running the browser entry point's page setup.
const app=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');
const classStart=app.indexOf('export class CardWheel {');
const classEnd=app.indexOf('\nconst workDialog=',classStart);
assert.ok(classStart>=0&&classEnd>classStart);
const wheelSource=app.slice(classStart,classEnd).replace('export class','class')+'\nCardWheel;';

function fixture(){
  const listeners=new Map(),classes=new Set(),captured=new Set();
  const control=()=>({addEventListener(){},setAttribute(){}});
  const container={
    querySelector:()=>({append(){},style:{}}),
    addEventListener(type,handler){listeners.set(type,handler);},
    classList:{add:name=>classes.add(name),remove:name=>classes.delete(name)},
    setPointerCapture:id=>captured.add(id),
    hasPointerCapture:id=>captured.has(id),
    releasePointerCapture:id=>captured.delete(id),
  };
  const CardWheel=runInNewContext(wheelSource,{
    ...wheelMath,
    WorkCard:class{constructor(){this.button={};}},
    document:{querySelector:control,addEventListener(){}},
    performance:{now:()=>1000},reducedMotion:true,
    ResizeObserver:class{observe(){}},IntersectionObserver:class{observe(){}},
  });
  CardWheel.prototype.render=function(){};
  const wheel=new CardWheel(container,[{},{},{},{},{}]);
  const send=(type,values={})=>listeners.get(type)({
    pointerId:7,pointerType:'touch',button:0,clientX:240,clientY:200,timeStamp:0,
    target:container,currentTarget:container,...values,
  });
  return {wheel,container,classes,send};
}

test('touch drag survives capture transferring from a card to the wheel',()=>{
  const {wheel,container,classes,send}=fixture(),card=wheel.cards[0].button;
  send('pointerdown',{target:card});
  send('pointermove',{target:card,clientX:220,timeStamp:20});
  assert.ok(container.hasPointerCapture(7));
  assert.ok(classes.has('dragging'));
  const initialRotation=wheel.rotation;

  // Touch initially captures the card. Its loss event bubbles during transfer.
  send('lostpointercapture',{target:card,timeStamp:21});
  assert.ok(wheel.drag,'the child capture loss must not cancel the swipe');
  send('pointermove',{clientX:80,timeStamp:100});
  assert.ok(wheel.rotation<initialRotation-10,'the wheel must keep following the finger');
  send('pointerup',{clientX:80,timeStamp:110});
  assert.equal(wheel.drag,null);
  assert.equal(classes.has('dragging'),false);
  assert.equal(container.hasPointerCapture(7),false);
  assert.ok(wheel.target<0,'release should advance to another card');
});

test('losing the wheel capture itself still cancels and settles the drag',()=>{
  const {wheel,classes,send}=fixture();
  send('pointerdown');
  send('pointermove',{clientX:180,timeStamp:30});
  send('lostpointercapture',{timeStamp:31});
  assert.equal(wheel.drag,null);
  assert.equal(wheel.velocity,0);
  assert.equal(classes.has('dragging'),false);
});

test('vertical touch movement remains available for scrolling the page',()=>{
  const {wheel,container,classes,send}=fixture();
  send('pointerdown');
  send('pointermove',{clientX:242,clientY:230,timeStamp:30});
  assert.equal(wheel.drag,null);
  assert.equal(wheel.rotation,0);
  assert.equal(container.hasPointerCapture(7),false);
  assert.equal(classes.has('dragging'),false);
});

test('pointer cancellation clears a drag while other pointer IDs cannot end it',()=>{
  const {wheel,classes,send}=fixture();
  send('pointerdown');
  send('pointermove',{clientX:180,timeStamp:30});
  send('lostpointercapture',{pointerId:8});
  assert.ok(wheel.drag);
  send('pointercancel',{timeStamp:40});
  assert.equal(wheel.drag,null);
  assert.equal(wheel.velocity,0);
  assert.equal(classes.has('dragging'),false);
});

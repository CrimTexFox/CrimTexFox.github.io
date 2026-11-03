import test from 'node:test';
import assert from 'node:assert/strict';
import {STAR_LAYERS,NEBULA_LAYERS,parallaxOffset,wrapCoordinate} from '../dist/space-background.js';
test('three star planes and two distinct clouds respond at different depths',()=>{
  assert.equal(STAR_LAYERS.length,3);assert.equal(NEBULA_LAYERS.length,2);
  const input={scroll:1000,pointerX:.7,pointerY:.3};
  const stars=STAR_LAYERS.map(layer=>parallaxOffset(layer,input));
  assert.ok(Math.abs(stars[0].y)<Math.abs(stars[1].y)&&Math.abs(stars[1].y)<Math.abs(stars[2].y));
  assert.ok(Math.abs(stars[0].x)<Math.abs(stars[1].x)&&Math.abs(stars[1].x)<Math.abs(stars[2].x));
  assert.notEqual(NEBULA_LAYERS[0].seed,NEBULA_LAYERS[1].seed);
  assert.notDeepEqual(parallaxOffset(NEBULA_LAYERS[0],input),parallaxOffset(NEBULA_LAYERS[1],input));
});
test('reduced motion removes parallax and pointer sway stays bounded',()=>{
  for(const layer of [...STAR_LAYERS,...NEBULA_LAYERS]){
    assert.deepEqual(parallaxOffset(layer,{scroll:4000,pointerX:1,pointerY:1,reducedMotion:true}),{x:0,y:0});
    assert.equal(parallaxOffset(layer,{pointerX:20}).x,-layer.pointer);
    assert.equal(parallaxOffset(layer,{pointerX:-20}).x,layer.pointer);
  }
});
test('star positions wrap continuously after large scrolls in either direction',()=>{
  for(const size of [390,844,1635])for(const position of [-120000,-1,0,1,120000]){
    const wrapped=wrapCoordinate(position,size);assert.ok(wrapped>=0&&wrapped<size);
    assert.equal(wrapCoordinate(position+size,size),wrapped);
  }
  assert.equal(wrapCoordinate(10,0),0);
});

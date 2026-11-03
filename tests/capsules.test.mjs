import test from 'node:test';
import assert from 'node:assert/strict';
import {capsuleContact,stepCapsules} from '../dist/capsule-physics.js';
const capsule=(x,y,width=100)=>({x,y,homeX:x,homeY:y,width,height:44,vx:0,vy:0,mass:1,phase:0,dragged:false});
test('capsule collisions follow the rounded ends rather than a rectangular bounding box',()=>{
  const a=capsule(100,100),b=capsule(200,142);
  assert.equal(capsuleContact(a,b),null);
  b.x=175;assert.ok(capsuleContact(a,b));
});
test('a dragged capsule pushes a neighbor without being pushed away from the pointer',()=>{
  const a=capsule(150,100),b=capsule(300,100);a.dragged=true;a.x=245;
  stepCapsules([a,b],1/30,{width:600,height:300,reducedMotion:true});
  assert.equal(a.x,245);assert.ok(b.x>300);assert.ok(!capsuleContact(a,b,4));
});
test('released capsules settle back to their grid positions after a collision',()=>{
  const a=capsule(150,100),b=capsule(300,100);a.x=250;a.vx=200;
  for(let i=0;i<1200;i++)stepCapsules([a,b],1/120,{width:600,height:300,reducedMotion:true});
  for(const p of [a,b]){assert.ok(Math.abs(p.x-p.homeX)<.1);assert.ok(Math.abs(p.y-p.homeY)<.1);assert.ok(Math.abs(p.vx)<.1);}
});
test('high-speed releases remain inside the invisible container',()=>{
  const a=capsule(100,100);a.vx=-2000;a.vy=-1600;
  for(let i=0;i<50;i++){stepCapsules([a],1/60,{width:500,height:240});assert.ok(a.x>=a.width/2);assert.ok(a.y>=a.height/2);}
});
test('capsules dragged past each other can route around a blocked return path',()=>{
  const a=capsule(150,90),b=capsule(150,160);a.y=160;b.y=90;
  for(let i=0;i<2400;i++)stepCapsules([a,b],1/120,{width:500,height:300,reducedMotion:true});
  for(const p of [a,b]){assert.ok(Math.abs(p.x-p.homeX)<.5);assert.ok(Math.abs(p.y-p.homeY)<.5);}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {capsuleContact,stepCapsules,SkillMotionState,releaseVelocity} from '../dist/capsule-physics.js';
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

test('capsule rebound speed is forty percent of its original strength in both motion states',()=>{
  for(const [returnToGrid,originalRebound] of [[false,.82],[true,.25]]){
    const a=capsule(150,100),b=capsule(250,100);a.vx=100;b.vx=-100;a.vy=b.vy=35;
    // Resolve contact without advancing time so drag and springs cannot alter impact speed.
    stepCapsules([a,b],0,{width:600,height:300,returnToGrid});
    assert.ok(a.vx<0&&b.vx>0,'the capsules must separate after impact');
    assert.ok(Math.abs((b.vx-a.vx)-200*originalRebound*.4)<1e-9);
    assert.equal(a.vy,35);assert.equal(b.vy,35);
  }
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
test('all skills wait three seconds after the latest release before returning',()=>{
  const motion=new SkillMotionState();assert.equal(motion.shouldReturn(0),true);
  motion.beginDrag();assert.equal(motion.shouldReturn(100000),false);
  motion.release(1000);assert.equal(motion.shouldReturn(3999),false);assert.equal(motion.shouldReturn(4000),true);
  motion.beginDrag();assert.equal(motion.shouldReturn(20000),false);
  motion.release(20000);assert.equal(motion.shouldReturn(22999),false);assert.equal(motion.shouldReturn(23000),true);
});
test('release retains fresh throwing velocity and ignores a stale movement sample',()=>{
  assert.equal(releaseVelocity(600,20),600);assert.ok(releaseVelocity(600,1000)<.1);
});
test('free drift transfers momentum to neighbors without pulling them toward home',()=>{
  const a=capsule(120,100),b=capsule(300,100);a.vx=450;
  for(let i=0;i<120;i++)stepCapsules([a,b],1/120,{width:1600,height:300,returnToGrid:false});
  assert.ok(b.x>b.homeX+100);assert.ok(b.vx>100);assert.ok(a.x>a.homeX+100);
});
test('the whole group begins returning together after its shared drift window',()=>{
  const a=capsule(120,100),b=capsule(300,100),motion=new SkillMotionState();a.vx=450;motion.release(0);
  for(let frame=0;frame<360;frame++)stepCapsules([a,b],1/120,{width:1600,height:300,reducedMotion:true,returnToGrid:motion.shouldReturn(frame/120*1000)});
  assert.ok(a.x>a.homeX+100&&b.x>b.homeX+100);
  for(let frame=360;frame<2160;frame++)stepCapsules([a,b],1/120,{width:1600,height:300,reducedMotion:true,returnToGrid:motion.shouldReturn(frame/120*1000)});
  for(const p of [a,b]){assert.ok(Math.abs(p.x-p.homeX)<.5);assert.ok(Math.abs(p.y-p.homeY)<.5);}
});

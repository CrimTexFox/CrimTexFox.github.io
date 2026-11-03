import test from 'node:test';
import assert from 'node:assert/strict';
import {CARD_SPACING,WHEEL_RADIUS,cardSlot,rotationBounds,cardPosition,cardsFitFrame,limitRotation,resistedRotation,springStep} from '../dist/wheel-math.js';
test('cards alternate from the center to the left and right on a fixed circle',()=>{
  assert.deepEqual(cardPosition(0,0),{angle:0,x:0,y:-WHEEL_RADIUS,visible:true});
  assert.deepEqual(Array.from({length:7},(_,i)=>cardSlot(i)),[0,-1,1,-2,2,-3,3]);
  for(let i=1;i<30;i++){
    const p=cardPosition(i,0);assert.ok(Math.abs(Math.hypot(p.x,p.y)-WHEEL_RADIUS)<1e-8);
  }
  assert.ok(cardPosition(1,0).x<0);assert.ok(cardPosition(2,0).x>0);
  assert.ok(cardPosition(3,0).x<cardPosition(1,0).x);assert.ok(cardPosition(4,0).x>cardPosition(2,0).x);
});
test('rotation stops at the physical left and right ends of the alternating list',()=>{
  assert.deepEqual(rotationBounds(5),{min:-80,max:80});assert.deepEqual(rotationBounds(4),{min:-40,max:80});
  for(const count of [0,1,5,16]){
    const bounds=rotationBounds(count);assert.equal(limitRotation(9999,count),bounds.max);assert.equal(limitRotation(-9999,count),bounds.min);
  }
  assert.ok(resistedRotation(120,5)>80&&resistedRotation(120,5)<120);
  assert.ok(resistedRotation(-120,5)<-80&&resistedRotation(-120,5)>-120);
});
test('endpoint release overshoots then settles on the endpoint without a permanent empty slot',()=>{
  let p=20,v=50,min=20;
  for(let frame=0;frame<360;frame++){const s=springStep(p,v,0,1/120);p=s.position;v=s.velocity;min=Math.min(min,p);}
  assert.ok(min<0,'spring should cross the endpoint for a gentle bounce');assert.ok(Math.abs(p)<.001);assert.ok(Math.abs(v)<.001);
});
test('large lists can advance beyond a full revolution without overlapping visible cards',()=>{
  const count=22,rotation=-cardSlot(count-1)*CARD_SPACING;
  const positions=Array.from({length:count},(_,i)=>cardPosition(i,rotation)).filter(p=>p.visible);
  assert.ok(positions.length<=9);assert.equal(cardPosition(count-1,rotation).angle,0);
  for(let i=0;i<positions.length;i++)for(let j=i+1;j<positions.length;j++)assert.ok(Math.hypot(positions[i].x-positions[j].x,positions[i].y-positions[j].y)>1);
});
test('idle motion distinguishes a fully visible hand from clipped sides or a rotated endpoint',()=>{
  const desktop={width:1066,height:520,cardWidth:176,cardHeight:248,centerY:454};
  assert.equal(cardsFitFrame(5,0,desktop),true);assert.equal(cardsFitFrame(5,80,desktop),false);
  assert.equal(cardsFitFrame(5,0,{width:346,height:500,cardWidth:151,cardHeight:217,centerY:434}),false);
});

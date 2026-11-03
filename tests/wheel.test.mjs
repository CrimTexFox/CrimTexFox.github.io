import test from 'node:test';
import assert from 'node:assert/strict';
import {CARD_SPACING,WHEEL_RADIUS,cardPosition,limitRotation,resistedRotation,springStep} from '../dist/wheel-math.js';
test('the first card is at the top and the next one proceeds clockwise on a fixed circle',()=>{
  assert.deepEqual(cardPosition(0,0),{angle:0,x:0,y:-WHEEL_RADIUS,visible:true});
  for(let i=1;i<30;i++){
    const p=cardPosition(i,0);assert.ok(Math.abs(Math.hypot(p.x,p.y)-WHEEL_RADIUS)<1e-8);
  }
  assert.ok(cardPosition(1,0).x>0);assert.equal(cardPosition(9,0).angle,360);
});
test('dragging is bounded by the real first and last entries, including an empty or one-card list',()=>{
  for(const count of [0,1,5,16]){
    assert.equal(limitRotation(9999,count),0);
    assert.equal(limitRotation(-9999,count),-Math.max(0,count-1)*CARD_SPACING);
  }
  assert.ok(resistedRotation(80,5)>0&&resistedRotation(80,5)<80);
  assert.ok(resistedRotation(-220,5)<-160&&resistedRotation(-220,5)>-220);
});
test('endpoint release overshoots then settles on the endpoint without a permanent empty slot',()=>{
  let p=20,v=50,min=20;
  for(let frame=0;frame<360;frame++){const s=springStep(p,v,0,1/120);p=s.position;v=s.velocity;min=Math.min(min,p);}
  assert.ok(min<0,'spring should cross the endpoint for a gentle bounce');assert.ok(Math.abs(p)<.001);assert.ok(Math.abs(v)<.001);
});
test('large lists can advance beyond a full revolution without overlapping visible cards',()=>{
  const count=22,rotation=-(count-1)*CARD_SPACING;
  const positions=Array.from({length:count},(_,i)=>cardPosition(i,rotation)).filter(p=>p.visible);
  assert.ok(positions.length<=9);assert.equal(cardPosition(count-1,rotation).angle,0);
  for(let i=0;i<positions.length;i++)for(let j=i+1;j<positions.length;j++)assert.ok(Math.hypot(positions[i].x-positions[j].x,positions[i].y-positions[j].y)>1);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {wheelIdleMotion,cardFanMotion,visibleFanOrder,FAN_PERIOD} from '../dist/wheel-motion.js';
import {CARD_SPACING,cardPosition} from '../dist/wheel-math.js';
test('passive movement stays gentle and cannot shift focus to another card',()=>{
  for(let time=0;time<144000;time+=173){
    const motion=wheelIdleMotion(time,1066,false);
    assert.ok(Math.abs(motion.shift)<=12);assert.ok(Math.abs(motion.rotation)<=.8);
    assert.equal(Math.abs(Math.round(motion.rotation/CARD_SPACING)),0);
    assert.equal(wheelIdleMotion(time,1066,true).shift,0);
    assert.ok(Math.abs(wheelIdleMotion(time,346,false).shift)<=8.65);
  }
});
test('fanning passes from one card to the next with only adjacent handoffs',()=>{
  const angles=[-80,-40,0,40,80];
  const peakTimes=[];
  for(const [order,angle] of angles.entries()){
    let peak={scale:0,time:0};
    for(let time=0;time<FAN_PERIOD;time+=20){
      const fan=cardFanMotion(time,angle,1,order);
      assert.ok(fan.scale>=1&&fan.scale<=1.028+1e-10);
      assert.ok(Math.abs(fan.spread)<=Math.abs(angle)*.014+1e-10);
      if(fan.scale>peak.scale)peak={scale:fan.scale,time};
    }
    assert.ok(peak.scale>1.027);peakTimes.push(peak.time);
    assert.deepEqual(cardFanMotion(12000,angle,1,order),{scale:1,spread:0});
    assert.deepEqual(cardFanMotion(3000,angle,0,order),{scale:1,spread:0});
  }
  for(let order=0;order<angles.length-1;order++){
    assert.ok(peakTimes[order]<peakTimes[order+1]);
    const handoff=(peakTimes[order]+peakTimes[order+1])/2;
    assert.ok(cardFanMotion(handoff-100,angles[order],1,order).scale>cardFanMotion(handoff+100,angles[order],1,order).scale);
    assert.ok(cardFanMotion(handoff-100,angles[order+1],1,order+1).scale<cardFanMotion(handoff+100,angles[order+1],1,order+1).scale);
  }
  for(let time=0;time<FAN_PERIOD;time+=20){
    const active=angles.map((angle,order)=>({order,...cardFanMotion(time,angle,1,order)})).filter(fan=>fan.scale>1.000001);
    assert.ok(active.length<=2,'the whole hand must not swell at once');
    if(active.length===2)assert.equal(active[1].order-active[0].order,1);
  }
  assert.deepEqual(cardFanMotion(3000,135),{scale:1,spread:0});
  assert.equal(cardFanMotion(3000,0).spread,0);
  assert.deepEqual(cardFanMotion(3000,0,1,-1),{scale:1,spread:0});
});
test('the wave follows visible screen positions rather than numbered entry order',()=>{
  const positions=Array.from({length:5},(_,index)=>({...cardPosition(index,0),index}));
  assert.deepEqual(visibleFanOrder(positions,{width:1066,height:520,cardWidth:176,cardHeight:248,centerY:454}),[3,1,0,2,4]);
  assert.deepEqual(visibleFanOrder(positions,{width:346,height:500,cardWidth:151,cardHeight:217,centerY:434}),[1,0,2]);
});

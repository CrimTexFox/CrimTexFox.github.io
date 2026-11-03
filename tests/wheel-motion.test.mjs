import test from 'node:test';
import assert from 'node:assert/strict';
import {wheelIdleMotion,cardFanMotion,FAN_PERIOD} from '../dist/wheel-motion.js';
import {CARD_SPACING} from '../dist/wheel-math.js';
test('passive movement stays gentle and cannot shift focus to another card',()=>{
  for(let time=0;time<144000;time+=173){
    const motion=wheelIdleMotion(time,1066,false);
    assert.ok(Math.abs(motion.shift)<=12);assert.ok(Math.abs(motion.rotation)<=.8);
    assert.equal(Math.abs(Math.round(motion.rotation/CARD_SPACING)),0);
    assert.equal(wheelIdleMotion(time,1066,true).shift,0);
    assert.ok(Math.abs(wheelIdleMotion(time,346,false).shift)<=8.65);
  }
});
test('fanning is a small left-to-right pulse with a long resting interval',()=>{
  const peakTimes=[];
  for(const angle of [-80,0,80]){
    let peak={scale:0,time:0};
    for(let time=0;time<FAN_PERIOD;time+=20){
      const fan=cardFanMotion(time,angle);
      assert.ok(fan.scale>=1&&fan.scale<=1.028+1e-10);
      assert.ok(Math.abs(fan.spread)<=Math.abs(angle)*.014+1e-10);
      if(fan.scale>peak.scale)peak={scale:fan.scale,time};
    }
    assert.ok(peak.scale>1.027);peakTimes.push(peak.time);
    assert.deepEqual(cardFanMotion(12000,angle),{scale:1,spread:0});
    assert.deepEqual(cardFanMotion(3000,angle,0),{scale:1,spread:0});
  }
  assert.ok(peakTimes[0]<peakTimes[1]&&peakTimes[1]<peakTimes[2]);
  assert.deepEqual(cardFanMotion(3000,135),{scale:1,spread:0});
  assert.equal(cardFanMotion(3000,0).spread,0);
});

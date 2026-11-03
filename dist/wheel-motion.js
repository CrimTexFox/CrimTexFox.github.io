// Passive motion settings are separate from drag/inertia and never change focus.
export const IDLE_PAN_MAX=12;
export const IDLE_SPIN_MAX=.8;
export const FAN_PERIOD=24000;
const FAN_DURATION=2600;
export function wheelIdleMotion(elapsedMs,width,allFit){
  const time=Math.max(0,elapsedMs);
  return {
    rotation:Math.sin(time*Math.PI*2/36000)*IDLE_SPIN_MAX,
    shift:allFit?0:Math.sin(time*Math.PI*2/48000)*Math.min(IDLE_PAN_MAX,width*.025)
  };
}
export function cardFanMotion(elapsedMs,angle,amount=1){
  if(Math.abs(angle)>110)return {scale:1,spread:0};
  const delay=1200+(angle+110)/220*1000;
  const phase=((elapsedMs-delay)%FAN_PERIOD+FAN_PERIOD)%FAN_PERIOD;
  const pulse=phase<FAN_DURATION?Math.sin(Math.PI*phase/FAN_DURATION)**2:0;
  const strength=pulse*Math.max(0,Math.min(1,amount));
  return {scale:1+strength*.028,spread:angle*strength*.014||0};
}

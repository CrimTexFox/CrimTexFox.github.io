// Passive motion settings are separate from drag/inertia and never change focus.
export const IDLE_PAN_MAX=12;
export const IDLE_SPIN_MAX=.8;
export const FAN_PERIOD=24000;
const FAN_STEP=700;
const FAN_DURATION=FAN_STEP*2;
export function wheelIdleMotion(elapsedMs,width,allFit){
  const time=Math.max(0,elapsedMs);
  return {
    rotation:Math.sin(time*Math.PI*2/36000)*IDLE_SPIN_MAX,
    shift:allFit?0:Math.sin(time*Math.PI*2/48000)*Math.min(IDLE_PAN_MAX,width*.025)
  };
}
export function visibleFanOrder(cards,{width,height,cardWidth,cardHeight,centerY,shift=0}){
  return cards.filter(card=>{
    if(!card.visible||Math.abs(card.angle)>110)return false;
    const angle=card.angle*Math.PI/180;
    const halfWidth=(Math.abs(Math.cos(angle))*cardWidth+Math.abs(Math.sin(angle))*cardHeight)/2;
    const halfHeight=(Math.abs(Math.sin(angle))*cardWidth+Math.abs(Math.cos(angle))*cardHeight)/2;
    const x=width/2+card.x+shift,y=centerY+card.y;
    const visibleWidth=Math.max(0,Math.min(width,x+halfWidth)-Math.max(0,x-halfWidth));
    const visibleHeight=Math.max(0,Math.min(height,y+halfHeight)-Math.max(0,y-halfHeight));
    return visibleWidth*visibleHeight>=halfWidth*halfHeight*4*.2;
  }).sort((a,b)=>a.x-b.x||a.index-b.index).map(card=>card.index);
}
export function cardFanMotion(elapsedMs,angle,amount=1,order=0){
  if(order<0||Math.abs(angle)>110)return {scale:1,spread:0};
  const delay=1200+order*FAN_STEP;
  const phase=((elapsedMs-delay)%FAN_PERIOD+FAN_PERIOD)%FAN_PERIOD;
  const pulse=phase<FAN_DURATION?Math.sin(Math.PI*phase/FAN_DURATION)**2:0;
  const strength=pulse*Math.max(0,Math.min(1,amount));
  return {scale:1+strength*.028,spread:angle*strength*.014||0};
}

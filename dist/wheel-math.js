// Radius and spacing stay fixed as entries are added; they never depend on count.
export const CARD_SPACING=40;
export const WHEEL_RADIUS=300;
export const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
// Entry order: 1 at the top, 2 left, 3 right, 4 farther left, 5 farther right.
export function cardSlot(index){return index===0?0:Math.ceil(index/2)*(index%2?-1:1);}
export function rotationBounds(count){
  const remaining=Math.max(0,count-1);
  return {min:-Math.floor(remaining/2)*CARD_SPACING||0,max:Math.ceil(remaining/2)*CARD_SPACING};
}
export function limitRotation(value,count){const {min,max}=rotationBounds(count);return clamp(value,min,max);}
export function resistedRotation(value,count){const edge=limitRotation(value,count);return edge+(value-edge)*.23;}
export function cardPosition(index,rotation,radius=WHEEL_RADIUS){
  const angle=cardSlot(index)*CARD_SPACING+rotation;
  const radians=angle*Math.PI/180;
  // At most one revolution is rendered, so large lists cannot stack cards.
  const visible=angle>=-150&&angle<=150;
  return {angle,x:Math.sin(radians)*radius,y:-Math.cos(radians)*radius,visible};
}
export function cardsFitFrame(count,rotation,{width,height,cardWidth,cardHeight,centerY}){
  for(let index=0;index<count;index++){
    const p=cardPosition(index,rotation),a=p.angle*Math.PI/180;
    const halfWidth=(Math.abs(Math.cos(a))*cardWidth+Math.abs(Math.sin(a))*cardHeight)/2;
    const halfHeight=(Math.abs(Math.sin(a))*cardWidth+Math.abs(Math.cos(a))*cardHeight)/2;
    if(!p.visible||Math.abs(p.x)+halfWidth>width/2||centerY+p.y-halfHeight<0||centerY+p.y+halfHeight>height)return false;
  }
  return true;
}
export function springStep(position,velocity,target,dt){
  const acceleration=(target-position)*210-velocity*19;
  velocity+=acceleration*dt;
  return {position:position+velocity*dt,velocity};
}

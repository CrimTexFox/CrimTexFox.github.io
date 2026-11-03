// Radius and spacing stay fixed as entries are added; they never depend on count.
export const CARD_SPACING=40;
export const WHEEL_RADIUS=300;
export const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
export function limitRotation(value,count){return clamp(value,-Math.max(0,count-1)*CARD_SPACING,0);}
export function resistedRotation(value,count){const edge=limitRotation(value,count);return edge+(value-edge)*.23;}
export function cardPosition(index,rotation,radius=WHEEL_RADIUS){
  const angle=index*CARD_SPACING+rotation;
  const radians=angle*Math.PI/180;
  // At most one revolution is rendered, so large lists cannot stack cards.
  const visible=angle>=-110&&angle<=210;
  return {angle,x:Math.sin(radians)*radius,y:-Math.cos(radians)*radius,visible};
}
export function springStep(position,velocity,target,dt){
  const acceleration=(target-position)*210-velocity*19;
  velocity+=acceleration*dt;
  return {position:position+velocity*dt,velocity};
}

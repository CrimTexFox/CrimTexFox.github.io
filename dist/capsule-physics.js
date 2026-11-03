const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const SKILL_RESET_DELAY=3000;
export class SkillMotionState {
  constructor(){this.dragging=false;this.resetAt=null;}
  beginDrag(){this.dragging=true;this.resetAt=null;}
  release(now){this.dragging=false;this.resetAt=now+SKILL_RESET_DELAY;}
  shouldReturn(now){return !this.dragging&&(this.resetAt===null||now>=this.resetAt);}
}
export function releaseVelocity(velocity,ageMs=0){return velocity*Math.exp(-Math.max(0,ageMs-60)/100);}
// Contact between two horizontal stadium shapes, including their round ends.
export function capsuleContact(a,b,gap=5){
  const ah=Math.max(0,(a.width-a.height)/2),bh=Math.max(0,(b.width-b.height)/2);
  let dx=0;
  if(a.x+ah<b.x-bh)dx=(b.x-bh)-(a.x+ah);
  else if(b.x+bh<a.x-ah)dx=(b.x+bh)-(a.x-ah);
  let dy=b.y-a.y,dist=Math.hypot(dx,dy),radius=(a.height+b.height)/2+gap;
  if(dist>=radius)return null;
  if(dist<.0001){dx=b.x>=a.x?1:-1;dy=0;dist=1;return {nx:dx,ny:0,depth:radius};}
  return {nx:dx/dist,ny:dy/dist,depth:radius-dist};
}
export function containCapsule(item,width,height,restitution=.25){
  const x=clamp(item.x,item.width/2+2,Math.max(item.width/2+2,width-item.width/2-2));
  const y=clamp(item.y,item.height/2+2,Math.max(item.height/2+2,height-item.height/2-2));
  if(x!==item.x){if(restitution!==null&&(item.x-x)*item.vx>0)item.vx*=-restitution;item.x=x;}
  if(y!==item.y){if(restitution!==null&&(item.y-y)*item.vy>0)item.vy*=-restitution;item.y=y;}
}
export function stepCapsules(items,dt,{width,height,time=0,reducedMotion=false,returnToGrid=true}={}){
  const steps=Math.max(1,Math.ceil(Math.min(dt,.04)/(1/120))),h=Math.min(dt,.04)/steps;
  for(let step=0;step<steps;step++){
    for(const p of items){
      if(p.dragged)continue;
      if(returnToGrid){
        const tx=p.homeX+(reducedMotion?0:Math.sin(time*.52+p.phase)*1.8),ty=p.homeY+(reducedMotion?0:Math.cos(time*.63+p.phase)*2.2);
        const stiffness=reducedMotion?28:8,damping=reducedMotion?11:5.4;
        p.vx+=((tx-p.x)*stiffness-p.vx*damping)*h;p.vy+=((ty-p.y)*stiffness-p.vy*damping)*h;
      }else{
        const friction=Math.exp(-.35*h);p.vx*=friction;p.vy*=friction;
      }
      p.vx=clamp(p.vx,-1100,1100);p.vy=clamp(p.vy,-1100,1100);p.x+=p.vx*h;p.y+=p.vy*h;
      containCapsule(p,width,height,returnToGrid ? .25 : .78);
    }
    for(let pass=0;pass<3;pass++)for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
      const a=items[i],b=items[j],contact=capsuleContact(a,b);if(!contact)continue;
      const ia=a.dragged?0:1/(a.mass||1),ib=b.dragged?0:1/(b.mass||1),total=ia+ib;if(!total)continue;
      // If dragging has swapped two neighbors, steer around the blockage.
      // Pure springs otherwise trap two capsules head-on between their homes.
      const hx=b.homeX-a.homeX,hy=b.homeY-a.homeY,homeDistance=Math.hypot(hx,hy);
      if(returnToGrid&&!a.dragged&&!b.dragged&&homeDistance>1&&(b.x-a.x)*hx+(b.y-a.y)*hy<0){
        const steer=(reducedMotion?28:8)*(Math.min(a.width,b.width)*.8+20)*h,tx=-hy/homeDistance,ty=hx/homeDistance;
        a.vx-=tx*steer*ia/total;a.vy-=ty*steer*ia/total;b.vx+=tx*steer*ib/total;b.vy+=ty*steer*ib/total;
      }
      const {nx,ny,depth}=contact,move=Math.max(0,depth-.05)*.85;
      a.x-=nx*move*ia/total;a.y-=ny*move*ia/total;b.x+=nx*move*ib/total;b.y+=ny*move*ib/total;
      const closing=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
      if(closing<0){const impulse=-(returnToGrid?1.25:1.82)*closing/total;a.vx-=impulse*nx*ia;a.vy-=impulse*ny*ia;b.vx+=impulse*nx*ib;b.vy+=impulse*ny*ib;}
      const bounce=returnToGrid ? .25 : .78;
      if(!a.dragged)containCapsule(a,width,height,bounce);if(!b.dragged)containCapsule(b,width,height,bounce);
    }
  }
}

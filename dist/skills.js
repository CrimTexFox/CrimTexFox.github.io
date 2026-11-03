import {containCapsule,stepCapsules} from './capsule-physics.js';
export class SkillCapsule {
  constructor(data,index,container){
    this.data=data;this.phase=index*2.39996;this.mass=data.mass||1;this.dragged=false;this.vx=0;this.vy=0;
    this.button=document.createElement('button');this.button.type='button';this.button.className='skill-capsule';this.button.textContent=data.label;
    this.button.setAttribute('aria-label',`${data.label}. Drag, or use arrow keys to move.`);
    this.button.dataset.skill=data.label;container.append(this.button);
  }
  render(){this.button.style.transform=`translate3d(${this.x-this.width/2}px,${this.y-this.height/2}px,0)`;}
}
export class SkillField {
  constructor(container,data,{reducedMotion=false}={}){
    this.container=container;this.reducedMotion=reducedMotion;this.frame=null;this.inView=false;this.drag=null;
    this.items=data.map((d,i)=>new SkillCapsule(d,i,container));
    this.items.forEach(item=>{
      item.button.addEventListener('pointerdown',e=>this.start(e,item));
      item.button.addEventListener('pointermove',e=>this.move(e));
      item.button.addEventListener('pointerup',e=>this.end(e));
      item.button.addEventListener('pointercancel',e=>this.end(e));
      item.button.addEventListener('lostpointercapture',e=>this.end(e));
      item.button.addEventListener('keydown',e=>this.key(e,item));
    });
    new ResizeObserver(()=>this.layout()).observe(container);
    new IntersectionObserver(entries=>{this.inView=entries[0].isIntersecting;if(this.inView)this.animate();},{rootMargin:'140px'}).observe(container);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)this.animate();});
    this.layout();document.fonts.ready.then(()=>this.layout());
  }
  layout(){
    const width=this.container.clientWidth;if(!width)return;
    const columns=Math.max(2,Math.floor(width/165)),cellWidth=width/columns,rowHeight=64,padding=28;
    this.width=width;this.height=Math.ceil(this.items.length/columns)*rowHeight+padding*2;
    this.container.style.height=`${this.height}px`;this.container.style.setProperty('--cell-width',`${cellWidth}px`);
    const lastRowCount=this.items.length%columns||columns;
    this.items.forEach((p,i)=>{
      const row=Math.floor(i/columns),column=i%columns,count=row===Math.ceil(this.items.length/columns)-1?lastRowCount:columns;
      p.width=p.button.offsetWidth;p.height=p.button.offsetHeight;
      p.homeX=(width-count*cellWidth)/2+cellWidth*(column+.5);p.homeY=padding+row*rowHeight+rowHeight/2;
      if(!p.dragged){p.x=p.homeX;p.y=p.homeY;p.vx=0;p.vy=0;}p.render();
    });
    this.animate();
  }
  start(e,item){
    if(e.button!==0||this.drag)return;e.preventDefault();
    item.button.focus({preventScroll:true});item.button.setPointerCapture(e.pointerId);item.button.classList.add('is-dragged');item.dragged=true;
    this.drag={item,id:e.pointerId,startX:e.clientX,startY:e.clientY,x:item.x,y:item.y,lastX:e.clientX,lastY:e.clientY,time:e.timeStamp};this.animate();
  }
  move(e){
    const d=this.drag;if(!d||d.id!==e.pointerId)return;e.preventDefault();
    const dt=Math.max(8,e.timeStamp-d.time)/1000;
    d.item.x=d.x+e.clientX-d.startX;d.item.y=d.y+e.clientY-d.startY;
    d.item.vx=Math.max(-650,Math.min(650,(e.clientX-d.lastX)/dt));d.item.vy=Math.max(-650,Math.min(650,(e.clientY-d.lastY)/dt));
    containCapsule(d.item,this.width,this.height);d.item.render();d.lastX=e.clientX;d.lastY=e.clientY;d.time=e.timeStamp;
  }
  end(e){
    const d=this.drag;if(!d||d.id!==e.pointerId)return;this.drag=null;d.item.dragged=false;d.item.vx*=.35;d.item.vy*=.35;
    d.item.button.classList.remove('is-dragged');if(d.item.button.hasPointerCapture(e.pointerId))d.item.button.releasePointerCapture(e.pointerId);this.animate();
  }
  key(e,p){
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','Escape'].includes(e.key))return;e.preventDefault();
    if(e.key==='Home'||e.key==='Escape'){p.x=p.homeX;p.y=p.homeY;p.vx=0;p.vy=0;}
    else{const dx=e.key==='ArrowLeft'?-28:e.key==='ArrowRight'?28:0,dy=e.key==='ArrowUp'?-28:e.key==='ArrowDown'?28:0;p.x+=dx;p.y+=dy;p.vx=dx*4;p.vy=dy*4;}
    containCapsule(p,this.width,this.height);p.render();this.animate();
  }
  animate(){
    if(this.frame||document.hidden)return;let last=performance.now();
    const tick=now=>{
      const dt=Math.min((now-last)/1000,.035);last=now;
      stepCapsules(this.items,dt,{width:this.width,height:this.height,time:now/1000,reducedMotion:this.reducedMotion});this.items.forEach(p=>p.render());
      const settling=this.items.some(p=>Math.abs(p.x-p.homeX)+Math.abs(p.y-p.homeY)+Math.abs(p.vx)+Math.abs(p.vy)>.15);
      if(this.inView&&!document.hidden&&(!this.reducedMotion||this.drag||settling))this.frame=requestAnimationFrame(tick);else this.frame=null;
    };this.frame=requestAnimationFrame(tick);
  }
}

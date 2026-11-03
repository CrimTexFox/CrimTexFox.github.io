// Back-to-front planes. Depth controls scrolling; pointer controls camera sway.
export const STAR_LAYERS=[
  {id:'distant-stars',weight:.56,depth:.008,pointer:4,radius:.65,alpha:.65,driftX:.12,driftY:.025},
  {id:'middle-stars',weight:.29,depth:.024,pointer:10,radius:.95,alpha:.85,driftX:.32,driftY:.06},
  {id:'near-stars',weight:.15,depth:.052,pointer:20,radius:1.3,alpha:1,driftX:.7,driftY:.13}
];
export const NEBULA_LAYERS=[
  {id:'distant-nebula',seed:194,depth:.016,pointer:7,x:.68,y:.34,width:1.18,minWidth:1100,opacity:.38,angle:-.3,drift:.006,phase:0},
  {id:'near-nebula',seed:487,depth:.039,pointer:15,x:.29,y:.74,width:.95,minWidth:850,opacity:.32,angle:.24,drift:.009,phase:2.1}
];
export function parallaxOffset(layer,{scroll=0,pointerX=0,pointerY=0,reducedMotion=false}={}){
  if(reducedMotion)return {x:0,y:0};
  const x=Math.max(-1,Math.min(1,pointerX)),y=Math.max(-1,Math.min(1,pointerY));
  return {x:-x*layer.pointer||0,y:-Math.max(0,scroll)*layer.depth-y*layer.pointer*.65||0};
}
export function wrapCoordinate(value,size){return size>0?((value%size)+size)%size:0;}

export class SpaceBackground {
  constructor(canvas){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.frame=null;this.lastPaint=-100;this.motion=matchMedia('(prefers-reduced-motion: reduce)');
    this.camera={scroll:scrollY,pointerX:0,pointerY:0};this.target={...this.camera};
    this.nebulaLayers=NEBULA_LAYERS.map(layer=>({...layer,texture:this.makeNebula(layer.seed)}));this.resize();
    addEventListener('resize',()=>this.resize());
    addEventListener('scroll',()=>{this.target.scroll=scrollY;},{passive:true});
    addEventListener('pointermove',event=>{
      if(event.pointerType==='touch')return;
      this.target.pointerX=event.clientX/Math.max(1,this.width)*2-1;this.target.pointerY=event.clientY/Math.max(1,this.height)*2-1;
    },{passive:true});
    const centerPointer=()=>{this.target.pointerX=0;this.target.pointerY=0;};
    addEventListener('blur',centerPointer);addEventListener('pointerout',event=>{if(!event.relatedTarget)centerPointer();},{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(this.frame);this.frame=null;}else this.animate();});
    this.motion.addEventListener('change',()=>{cancelAnimationFrame(this.frame);this.frame=null;this.draw(0);this.animate();});this.animate();
  }
  makeNebula(initialSeed){
    const canvas=document.createElement('canvas');canvas.width=800;canvas.height=520;const ctx=canvas.getContext('2d');
    let seed=initialSeed;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
    for(let i=0;i<54;i++){
      const x=100+random()*600,y=210+Math.sin(x*.011+initialSeed*.01)*95+(random()-.5)*120,r=65+random()*90;
      const gradient=ctx.createRadialGradient(x,y,0,x,y,r);
      const gray=i%5===0;gradient.addColorStop(0,gray?'rgba(151,145,130,.085)':'rgba(168,86,32,.11)');
      gradient.addColorStop(.48,gray?'rgba(90,87,83,.04)':'rgba(89,48,26,.06)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(x-r,y-r,r*2,r*2);
    }
    return canvas;
  }
  resize(){
    this.width=innerWidth;this.height=innerHeight;const dpr=Math.min(devicePixelRatio,1.5);this.canvas.width=this.width*dpr;this.canvas.height=this.height*dpr;this.ctx.setTransform(dpr,0,0,dpr,0,0);
    this.starLayers=STAR_LAYERS.map((layer,index)=>{
      let seed=23+index*1607;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
      const stars=Array.from({length:Math.max(1,Math.round(this.width*this.height/4800*layer.weight))},()=>({x:random(),y:random(),r:(.3+random()*.85)*layer.radius,alpha:(.12+random()*.39)*layer.alpha,phase:random()*Math.PI*2,speed:.45+random()*.7,twinkle:.18+random()*.45,mango:random()>.93}));
      return {...layer,stars};
    });
    this.draw(this.motion.matches?0:performance.now()/1000);
  }
  drawNebula(layer,time){
    const ctx=this.ctx,w=this.width,h=this.height,offset=parallaxOffset(layer,{...this.camera,reducedMotion:this.motion.matches});
    ctx.save();ctx.globalAlpha=layer.opacity;
    ctx.translate(w*layer.x+Math.sin(time*layer.drift+layer.phase)*w*.055+offset.x,h*layer.y+Math.cos(time*layer.drift*.8+layer.phase)*h*.045+offset.y);
    ctx.rotate(layer.angle+Math.sin(time*.005+layer.phase)*.05);
    const width=Math.max(layer.minWidth,w*layer.width);ctx.drawImage(layer.texture,-width/2,-width*.325,width,width*.65);ctx.restore();
  }
  drawStars(layer,time){
    const ctx=this.ctx,w=this.width,h=this.height,offset=parallaxOffset(layer,{...this.camera,reducedMotion:this.motion.matches});
    for(const star of layer.stars){
      const x=wrapCoordinate(star.x*w+time*star.speed*layer.driftX+offset.x,w),y=wrapCoordinate(star.y*h+Math.sin(time*.035+star.phase)*3+time*star.speed*layer.driftY+offset.y,h);
      const shine=Math.pow(Math.max(0,Math.sin(time*star.twinkle+star.phase)),22),alpha=Math.min(1,star.alpha+shine*.55*layer.alpha);
      ctx.fillStyle=star.mango?`rgba(255,185,94,${alpha})`:`rgba(245,239,228,${alpha})`;
      ctx.beginPath();ctx.arc(x,y,star.r+shine*.4*layer.radius,0,Math.PI*2);ctx.fill();
      if(shine>.65){ctx.strokeStyle=`rgba(255,235,205,${(shine-.65)*.65*layer.alpha})`;ctx.lineWidth=.55;const rays=(2+shine*2)*layer.radius;ctx.beginPath();ctx.moveTo(x-rays,y);ctx.lineTo(x+rays,y);ctx.moveTo(x,y-rays);ctx.lineTo(x,y+rays);ctx.stroke();}
    }
  }
  draw(time){
    if(this.motion.matches)time=0;
    this.ctx.clearRect(0,0,this.width,this.height);
    this.drawStars(this.starLayers[0],time);this.drawNebula(this.nebulaLayers[0],time);
    this.drawStars(this.starLayers[1],time);this.drawNebula(this.nebulaLayers[1],time);this.drawStars(this.starLayers[2],time);
  }
  animate(){
    if(this.frame||document.hidden||this.motion.matches)return;
    const tick=now=>{
      if(now-this.lastPaint>=32){
        const dt=Math.min(Math.max(0,(now-this.lastPaint)/1000),.1),ease=1-Math.exp(-dt*4.5);
        for(const key of ['scroll','pointerX','pointerY'])this.camera[key]+=(this.target[key]-this.camera[key])*ease;
        this.draw(now/1000);this.lastPaint=now;
      }
      this.frame=requestAnimationFrame(tick);
    };this.frame=requestAnimationFrame(tick);
  }
}

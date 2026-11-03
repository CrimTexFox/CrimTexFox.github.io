export class SpaceBackground {
  constructor(canvas){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.frame=null;this.lastPaint=-100;this.motion=matchMedia('(prefers-reduced-motion: reduce)');
    this.nebula=this.makeNebula();this.resize();
    addEventListener('resize',()=>this.resize());
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(this.frame);this.frame=null;}else this.animate();});
    this.motion.addEventListener('change',()=>{cancelAnimationFrame(this.frame);this.frame=null;this.draw(0);this.animate();});this.animate();
  }
  makeNebula(){
    const canvas=document.createElement('canvas');canvas.width=800;canvas.height=520;const ctx=canvas.getContext('2d');
    let seed=194;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
    for(let i=0;i<54;i++){
      const x=100+random()*600,y=210+Math.sin(x*.011)*95+(random()-.5)*120,r=65+random()*90;
      const gradient=ctx.createRadialGradient(x,y,0,x,y,r);
      const gray=i%5===0;gradient.addColorStop(0,gray?'rgba(151,145,130,.085)':'rgba(168,86,32,.11)');
      gradient.addColorStop(.48,gray?'rgba(90,87,83,.04)':'rgba(89,48,26,.06)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(x-r,y-r,r*2,r*2);
    }
    return canvas;
  }
  resize(){
    this.width=innerWidth;this.height=innerHeight;const dpr=Math.min(devicePixelRatio,1.5);this.canvas.width=this.width*dpr;this.canvas.height=this.height*dpr;this.ctx.setTransform(dpr,0,0,dpr,0,0);
    let seed=23;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
    this.stars=Array.from({length:Math.round(this.width*this.height/4800)},()=>({x:random(),y:random(),r:.3+random()*.85,alpha:.12+random()*.39,phase:random()*Math.PI*2,speed:.3+random()*.65,twinkle:.18+random()*.45,mango:random()>.93}));
    this.draw(this.motion.matches?0:performance.now()/1000);
  }
  draw(time){
    const ctx=this.ctx,w=this.width,h=this.height;ctx.clearRect(0,0,w,h);
    ctx.save();ctx.globalAlpha=.64;ctx.translate(w*.65+Math.sin(time*.012)*w*.09,h*.5+Math.cos(time*.016)*h*.08);ctx.rotate(-.25+Math.sin(time*.009)*.1);
    const nebulaWidth=Math.max(1050,w*.95);ctx.drawImage(this.nebula,-nebulaWidth/2,-nebulaWidth*.325,nebulaWidth,nebulaWidth*.65);ctx.restore();
    for(const star of this.stars){
      const x=((star.x*w+time*star.speed*.8)%w+w)%w,y=((star.y*h+Math.sin(time*.035+star.phase)*4+time*star.speed*.13)%h+h)%h;
      const shine=Math.pow(Math.max(0,Math.sin(time*star.twinkle+star.phase)),22),alpha=Math.min(1,star.alpha+shine*.65);
      ctx.fillStyle=star.mango?`rgba(255,185,94,${alpha})`:`rgba(245,239,228,${alpha})`;
      ctx.beginPath();ctx.arc(x,y,star.r+shine*.5,0,Math.PI*2);ctx.fill();
      if(shine>.65){ctx.strokeStyle=`rgba(255,235,205,${(shine-.65)*.7})`;ctx.lineWidth=.55;const rays=2+shine*2;ctx.beginPath();ctx.moveTo(x-rays,y);ctx.lineTo(x+rays,y);ctx.moveTo(x,y-rays);ctx.lineTo(x,y+rays);ctx.stroke();}
    }
  }
  animate(){
    if(this.frame||document.hidden||this.motion.matches)return;
    const tick=now=>{if(now-this.lastPaint>=32){this.draw(now/1000);this.lastPaint=now;}this.frame=requestAnimationFrame(tick);};this.frame=requestAnimationFrame(tick);
  }
}

import {experiences,projects} from './data.js';
import {CARD_SPACING,WHEEL_RADIUS,clamp,limitRotation,resistedRotation,cardPosition,springStep} from './wheel-math.js';
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const element=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
document.querySelector('#year').textContent=new Date().getFullYear();

// Each work entry is one reusable card. Content lives in data.js.
export class WorkCard {
  constructor(data,index,onSelect){
    this.data=data;this.index=index;
    this.button=element('button','work-card');
    this.button.type='button';
    this.button.setAttribute('aria-label',`${data.company}, ${data.role}. Open experience`);
    this.button.setAttribute('aria-haspopup','dialog');
    const lift=element('div','card-lift');lift.append(this.createFront());this.button.append(lift);
    this.button.addEventListener('click',()=>onSelect(this));
  }
  createFront(){
    const face=element('div','card-face');face.setAttribute('aria-hidden','true');
    for(const bottom of [false,true]){
      const corner=element('div',`card-corner${bottom?' bottom':''}`,String(this.index+1).padStart(2,'0'));
      corner.append(element('span','',this.data.suit));face.append(corner);
    }
    const mark=element('div','company-mark');
    if(this.data.mark==='openai'){
      const img=element('img');img.src='./assets/openai.svg';img.alt='';mark.append(img,element('span','','OpenAI'));
    }else if(this.data.mark==='incall'){
      const img=element('img','incall-logo');img.src='./assets/incall.png';img.alt='inCall.ai';mark.append(img);
    }else if(this.data.mark==='commissary'){
      mark.append(element('span','club','Commissary'),element('small','','C L U B'));
    }else if(this.data.mark==='pcb'){
      mark.append(element('span','chip-symbol','⌘'),element('span','','PCB / BOM'));
    }else{
      mark.append(element('span','stem','SV Stem Lab'),element('small','','ROBOTICS'));
    }
    face.append(mark,element('span','card-edition',this.data.year));return face;
  }
  createBack(){
    const d=this.data,back=element('div','selected-back');
    back.append(element('p','eyebrow',d.division||'EXPERIENCE'),element('h2','',d.company),element('h3','',d.role),element('p','work-dates',d.dates));
    const list=element('ul');d.points.forEach(p=>list.append(element('li','',p)));back.append(list,element('p','work-tech',d.tech.join(' · ')));
    if(d.url){const a=element('a','work-company-link','Company ↗');a.href=d.url;a.target='_blank';a.rel='noopener noreferrer';back.append(a);}
    return back;
  }
}

export class CardWheel {
  constructor(container,data){
    this.container=container;this.holder=container.querySelector('.card-holder');
    this.rotation=0;this.target=0;this.velocity=0;this.drag=null;this.frame=null;this.lastDrag=0;
    this.cards=data.map((d,i)=>new WorkCard(d,i,card=>{if(performance.now()-this.lastDrag>220)openWork(card);}));
    this.cards.forEach(c=>this.holder.append(c.button));
    this.previous=document.querySelector('#previous');this.next=document.querySelector('#next');this.status=document.querySelector('#wheel-position');
    this.previous.addEventListener('click',()=>this.go(-1));this.next.addEventListener('click',()=>this.go(1));
    container.addEventListener('pointerdown',e=>this.start(e));
    container.addEventListener('pointermove',e=>this.move(e));
    container.addEventListener('pointerup',e=>this.end(e));container.addEventListener('pointercancel',e=>this.end(e,true));
    container.addEventListener('lostpointercapture',e=>this.end(e,true));
    container.addEventListener('keydown',e=>{
      if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){
        e.preventDefault();
        if(e.key==='Home')this.setTarget(0);else if(e.key==='End')this.setTarget(-(this.cards.length-1)*CARD_SPACING);else this.go(e.key==='ArrowRight'?1:-1);
      }
    });
    new ResizeObserver(()=>this.render()).observe(container);this.render();this.updateStatus();
  }
  start(e){
    if(e.button!==0||this.cards.length<2)return;
    if(this.frame)cancelAnimationFrame(this.frame);this.frame=null;
    this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,rotation:this.rotation,lastX:e.clientX,time:e.timeStamp,moved:false};
    this.velocity=0;
  }
  move(e){
    const d=this.drag;if(!d||d.id!==e.pointerId)return;
    const dx=e.clientX-d.x,dy=e.clientY-d.y;
    if(!d.moved){
      if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){this.drag=null;this.setTarget(this.target);return;}
      if(Math.abs(dx)<5)return;
      d.moved=true;this.container.setPointerCapture(e.pointerId);this.container.classList.add('dragging');
    }
    const now=e.timeStamp,dt=Math.max(8,now-d.time)/1000;
    const sensitivity=180/(Math.PI*WHEEL_RADIUS);
    const raw=d.rotation+dx*sensitivity;
    this.rotation=resistedRotation(raw,this.cards.length);
    this.velocity=clamp((e.clientX-d.lastX)*sensitivity/dt,-300,300);
    d.lastX=e.clientX;d.time=now;this.render();
  }
  end(e,cancelled=false){
    const d=this.drag;if(!d||d.id!==e.pointerId)return;
    this.drag=null;this.container.classList.remove('dragging');
    if(d.moved){this.lastDrag=performance.now();if(this.container.hasPointerCapture(e.pointerId))this.container.releasePointerCapture(e.pointerId);}
    if(cancelled)this.velocity=0;
    const projected=this.rotation+(d.moved?this.velocity*.12:0);
    this.setTarget(Math.round(projected/CARD_SPACING)*CARD_SPACING);
  }
  go(direction){
    const next=limitRotation(this.target-direction*CARD_SPACING,this.cards.length);
    // A small elastic nudge at the endpoints gives feedback without exposing an empty slot.
    if(next===this.target&&!reducedMotion)this.velocity=direction>0?-40:40;
    this.setTarget(next);
  }
  setTarget(value){
    this.target=limitRotation(value,this.cards.length);this.updateStatus();
    if(reducedMotion){this.rotation=this.target;this.velocity=0;this.render();return;}
    if(this.frame)cancelAnimationFrame(this.frame);
    let last=performance.now();
    const tick=now=>{
      const dt=Math.min((now-last)/1000,.025);last=now;
      const state=springStep(this.rotation,this.velocity,this.target,dt);this.rotation=state.position;this.velocity=state.velocity;this.render();
      if(Math.abs(this.rotation-this.target)<.025&&Math.abs(this.velocity)<.05){this.rotation=this.target;this.velocity=0;this.render();this.frame=null;}
      else this.frame=requestAnimationFrame(tick);
    };this.frame=requestAnimationFrame(tick);
  }
  updateStatus(){
    const selected=Math.round(-this.target/CARD_SPACING);
    this.status.textContent=`${String(selected+1).padStart(2,'0')} / ${String(this.cards.length).padStart(2,'0')}`;
    this.previous.setAttribute('aria-disabled',String(selected===0));this.next.setAttribute('aria-disabled',String(selected===this.cards.length-1));
  }
  render(){
    const mobile=matchMedia('(max-width: 600px)').matches,centerY=mobile?434:454,cardWidth=mobile?151:176,cardHeight=mobile?217:248;
    this.cards.forEach((c,i)=>{
      const p=cardPosition(i,this.rotation);
      c.button.style.transform=`translate(${p.x-cardWidth/2}px,${centerY+p.y-cardHeight/2}px) rotate(${p.angle}deg)`;
      c.button.style.zIndex=String(Math.round(200-Math.abs(p.angle)));
      c.button.style.visibility=p.visible?'visible':'hidden';
      c.button.tabIndex=p.visible&&Math.abs(p.angle)<85?0:-1;
      c.button.setAttribute('aria-hidden',String(!p.visible));
    });
  }
}

const workDialog=document.querySelector('#work-dialog'),projectDialog=document.querySelector('#project-dialog');
let activeCard=null,activeBox=null,closingWork=false;
function markModal(open){document.body.classList.toggle('modal-open',open);}
function openWork(card){
  if(workDialog.open)return;activeCard=card;
  const stage=workDialog.querySelector('.selected-card-stage');stage.replaceChildren();
  const flip=element('div','selected-card'),front=card.createFront();front.classList.add('selected-front');flip.append(front,card.createBack());stage.append(flip);
  markModal(true);workDialog.showModal();
  const start=card.button.getBoundingClientRect(),end=stage.getBoundingClientRect();
  if(!reducedMotion)stage.animate([{transform:`translate(${start.x+start.width/2-end.x-end.width/2}px,${start.y+start.height/2-end.y-end.height/2}px) scale(${start.width/end.width},${start.height/end.height})`},{transform:'none'}],{duration:620,easing:'cubic-bezier(.18,.8,.2,1)'});
  requestAnimationFrame(()=>requestAnimationFrame(()=>flip.classList.add('is-flipped')));
}
async function closeWork(){
  if(!workDialog.open||closingWork)return;closingWork=true;
  if(!reducedMotion){
    const stage=workDialog.querySelector('.selected-card-stage');const flip=stage.firstElementChild;
    flip.classList.remove('is-flipped');
    await stage.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.8) translateY(20px)'}],{duration:220,easing:'ease-in',fill:'forwards'}).finished;
  }
  workDialog.close();markModal(false);activeCard?.button.focus({preventScroll:true});activeCard=null;closingWork=false;
}
workDialog.querySelector('.close-button').addEventListener('click',closeWork);
workDialog.addEventListener('cancel',e=>{e.preventDefault();closeWork();});
workDialog.addEventListener('click',e=>{if(e.target===workDialog){const r=workDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeWork();}});

function openProject(project,box){
  activeBox=box;box.setOpen(true);
  const content=document.querySelector('#project-content');content.replaceChildren();
  content.append(element('p','eyebrow',project.kind.toUpperCase()));
  const heading=element('h2','',project.title);heading.id='project-modal-title';content.append(heading,element('p','project-description',project.description));
  if(project.points?.length){const ul=element('ul','project-notes');project.points.forEach(p=>ul.append(element('li','',p)));content.append(ul);}
  content.append(element('p','project-technologies',project.tech.join(' / ')));
  if(project.links?.length){const links=element('div','project-links');project.links.forEach(link=>{const a=element('a','',`${link.label} ↗`);a.href=link.url;a.target='_blank';a.rel='noopener noreferrer';links.append(a);});content.append(links);}
  const gallery=element('div','project-gallery');
  for(const media of project.media||[]){
    if(media.type==='image'){
      const img=element('img');img.src=media.src;img.alt=media.alt;img.loading='lazy';gallery.append(img);
    }else if(media.type==='video'){
      const video=element('video');video.controls=true;video.playsInline=true;video.preload='metadata';video.src=media.src;if(media.poster)video.poster=media.poster;gallery.append(video);
    }else if(media.type==='youtube-playlist'){
      const button=element('button','video-load');button.append(element('strong','','▷  Watch gameplay'),element('span','','Load YouTube player'));
      button.addEventListener('click',()=>{const frame=element('iframe');frame.title='Cat RPG gameplay videos';frame.src=`https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(media.id)}`;frame.allow='fullscreen; picture-in-picture';frame.allowFullscreen=true;gallery.replaceChild(frame,button);});gallery.append(button);
    }else if(media.type==='illustration'){
      const figure=element('figure'),img=element('img','robot-illustration');img.src='./assets/robot-setup.svg';img.alt='Illustrated four-axis robotic arm, Raspberry Pi, breadboard, and wires';figure.append(img,element('figcaption','',media.caption));gallery.append(figure);
    }
  }
  content.append(gallery);markModal(true);projectDialog.showModal();projectDialog.scrollTop=0;
}
function closeProject(){
  if(!projectDialog.open)return;projectDialog.close();markModal(false);
  projectDialog.querySelectorAll('iframe').forEach(f=>f.remove());projectDialog.querySelectorAll('video').forEach(v=>v.pause());
  activeBox?.setOpen(false);activeBox?.button.focus({preventScroll:true});activeBox=null;
}
projectDialog.querySelector('.close-button').addEventListener('click',closeProject);
projectDialog.addEventListener('cancel',e=>{e.preventDefault();closeProject();});
projectDialog.addEventListener('click',e=>{if(e.target===projectDialog){const r=projectDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeProject();}});
new CardWheel(document.querySelector('#wheel'),experiences);

// A quiet, deterministic starfield; no images or looping background animations.
const canvas=document.querySelector('#stars'),ctx=canvas.getContext('2d');
function drawStars(){
  const dpr=Math.min(devicePixelRatio,2),w=innerWidth,h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  let seed=23;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  for(let i=0;i<Math.round(w*h/6500);i++){const x=random()*w,y=random()*h,r=random()*.8+.3;ctx.fillStyle=`rgba(245,239,224,${.13+random()*.48})`;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
  [[.12,.32],[.86,.21],[.76,.78],[.23,.89]].forEach(([x,y],i)=>{ctx.strokeStyle=i%2?'#ffb04580':'#ffffff60';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(w*x-3,h*y);ctx.lineTo(w*x+3,h*y);ctx.moveTo(w*x,h*y-3);ctx.lineTo(w*x,h*y+3);ctx.stroke();});
}
addEventListener('resize',drawStars);drawStars();

// Content remains navigable if a browser cannot create a WebGL context.
await document.fonts.ready;
try {
  const {ProjectBox}=await import('./project-box.js');
  projects.forEach(project=>new ProjectBox(document.querySelector('#project-grid'),project,(box)=>openProject(project,box),reducedMotion));
}catch(error){
  console.warn('3D rendering unavailable; using project fallback.',error);
  projects.forEach(project=>{
    const button=element('button','project-button');button.setAttribute('aria-label',`Open ${project.title}`);
    const scene=element('div','project-scene');scene.append(element('div','scene-fallback'));button.append(scene,element('h3','',project.title),element('p','project-kind',project.kind));
    const box={button,setOpen:()=>{}};button.addEventListener('click',()=>openProject(project,box));document.querySelector('#project-grid').append(button);
  });
}

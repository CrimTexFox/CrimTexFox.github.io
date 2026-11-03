import {experiences,projects,skills} from './data.js?v=20261103-cards2';
import {CARD_SPACING,WHEEL_RADIUS,clamp,cardSlot,rotationBounds,limitRotation,resistedRotation,cardPosition,cardsFitFrame,springStep} from './wheel-math.js';
import {SkillField} from './skills.js?v=20261103-skills-bounce';
import {SpaceBackground} from './space-background.js?v=20261103-parallax';
import {wheelIdleMotion,cardFanMotion,visibleFanOrder,FAN_PERIOD} from './wheel-motion.js?v=20261103-card-wave';
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
    this.container=container;this.holder=container.querySelector('.card-holder');this.stage=container.querySelector('.wheel-stage');
    this.rotation=0;this.target=0;this.velocity=0;this.drag=null;this.frame=null;this.lastDrag=-1000;this.lastInteraction=performance.now();
    this.idleAngle=0;this.idleShift=0;this.idleFan=0;this.idleClock=0;this.fanCycle=-1;this.fanOrder=[];this.wasIdle=false;this.hovered=false;this.inView=false;
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
        if(e.key==='Home')this.setTarget(0);else if(e.key==='End')this.setTarget(-cardSlot(this.cards.length-1)*CARD_SPACING);else this.go(e.key==='ArrowRight'?1:-1);
      }
    });
    container.addEventListener('pointerenter',()=>{this.hovered=true;this.lastInteraction=performance.now();});
    container.addEventListener('pointerleave',()=>{this.hovered=false;this.lastInteraction=performance.now();});
    container.addEventListener('focusin',()=>{this.lastInteraction=performance.now();});
    new ResizeObserver(()=>{this.fanCycle=-1;this.render();}).observe(container);
    new IntersectionObserver(entries=>{this.inView=entries[0].isIntersecting;if(this.inView)this.animate();},{rootMargin:'100px'}).observe(container);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)this.animate();});
    this.render();this.updateStatus();
  }
  start(e){
    if(e.button!==0||this.cards.length<2)return;
    this.lastInteraction=performance.now();
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
    if(d.moved||cancelled){const projected=this.rotation+(d.moved?this.velocity*.12:0);this.setTarget(Math.round(projected/CARD_SPACING)*CARD_SPACING);}
  }
  go(direction){
    const next=limitRotation(this.target-direction*CARD_SPACING,this.cards.length);
    // A small elastic nudge at the endpoints gives feedback without exposing an empty slot.
    if(next===this.target&&!reducedMotion)this.velocity=direction>0?-40:40;
    this.setTarget(next);
  }
  setTarget(value){
    this.lastInteraction=performance.now();this.target=limitRotation(value,this.cards.length);this.updateStatus();
    if(reducedMotion){this.rotation=this.target;this.velocity=0;this.render();return;}
    this.animate();
  }
  animate(){
    if(this.frame||document.hidden)return;
    let last=performance.now();
    const tick=now=>{
      const dt=Math.min((now-last)/1000,.025);last=now;
      if(!this.drag){
        const state=springStep(this.rotation,this.velocity,this.target,dt);this.rotation=state.position;this.velocity=state.velocity;
        if(Math.abs(this.rotation-this.target)<.025&&Math.abs(this.velocity)<.05){this.rotation=this.target;this.velocity=0;}
      }
      const idle=!reducedMotion&&!this.drag&&!this.hovered&&!this.container.matches(':focus-within')&&!document.querySelector('dialog[open]')&&now-this.lastInteraction>4500;
      const width=this.container.clientWidth,mobile=matchMedia('(max-width: 600px)').matches;
      const allFit=cardsFitFrame(this.cards.length,this.rotation,{width,height:this.container.clientHeight,cardWidth:mobile?151:176,cardHeight:mobile?217:248,centerY:mobile?434:454});
      if(idle){if(!this.wasIdle){this.idleClock=0;this.fanCycle=-1;}this.idleClock+=dt*1000;}
      this.wasIdle=idle;
      const motion=wheelIdleMotion(this.idleClock,width,allFit);
      const ease=1-Math.exp(-dt*2);
      this.idleAngle+=((idle?motion.rotation:0)-this.idleAngle)*ease;
      this.idleShift+=((idle?motion.shift:0)-this.idleShift)*ease;
      this.idleFan+=((idle?1:0)-this.idleFan)*ease;
      this.render();
      if(this.inView&&!document.hidden&&!reducedMotion)this.frame=requestAnimationFrame(tick);else this.frame=null;
    };this.frame=requestAnimationFrame(tick);
  }
  updateStatus(){
    const selected=this.cards.findIndex((_,i)=>cardSlot(i)===Math.round(-this.target/CARD_SPACING));
    this.status.textContent=`${String(selected+1).padStart(2,'0')} / ${String(this.cards.length).padStart(2,'0')}`;
    const bounds=rotationBounds(this.cards.length);
    this.previous.setAttribute('aria-disabled',String(this.target===bounds.max));this.next.setAttribute('aria-disabled',String(this.target===bounds.min));
  }
  render(){
    const mobile=matchMedia('(max-width: 600px)').matches,centerY=mobile?434:454,cardWidth=mobile?151:176,cardHeight=mobile?217:248;
    this.stage.style.transform=`translateX(${this.idleShift}px)`;
    const positions=this.cards.map((_,index)=>({...cardPosition(index,this.rotation+this.idleAngle),index}));
    const cycle=Math.floor(this.idleClock/FAN_PERIOD);
    if(cycle!==this.fanCycle){
      this.fanOrder=visibleFanOrder(positions,{width:this.container.clientWidth,height:this.container.clientHeight,cardWidth,cardHeight,centerY,shift:this.idleShift});
      this.fanCycle=cycle;
    }
    this.cards.forEach((c,i)=>{
      const base=positions[i],fan=cardFanMotion(this.idleClock,base.angle,this.idleFan,this.fanOrder.indexOf(i));
      const p=cardPosition(i,this.rotation+this.idleAngle+fan.spread);
      c.button.style.transform=`translate(${p.x-cardWidth/2}px,${centerY+p.y-cardHeight/2}px) rotate(${p.angle}deg) scale(${fan.scale})`;
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
function wheelCardTransform(card,stage){
  const lift=card.button.querySelector('.card-lift'),source=lift.getBoundingClientRect(),target=stage.getBoundingClientRect();
  const matrixFor=el=>{const value=getComputedStyle(el).transform;return new DOMMatrixReadOnly(value==='none'?undefined:value);};
  const matrix=matrixFor(card.button).multiply(matrixFor(lift));
  const x=source.x+source.width/2-target.x-target.width/2,y=source.y+source.height/2-target.y-target.height/2;
  const rotation=Math.atan2(matrix.b,matrix.a)*180/Math.PI;
  const scaleX=card.button.offsetWidth*Math.hypot(matrix.a,matrix.b)/target.width;
  const scaleY=card.button.offsetHeight*Math.hypot(matrix.c,matrix.d)/target.height;
  return `translate(${x}px,${y}px) rotate(${rotation}deg) scale(${scaleX},${scaleY})`;
}
function openWork(card){
  if(workDialog.open)return;activeCard=card;
  workDialog.classList.remove('is-closing');
  const stage=workDialog.querySelector('.selected-card-stage');
  // A filled closing animation survives replaceChildren(). Clear it before reuse.
  stage.getAnimations().forEach(animation=>animation.cancel());stage.replaceChildren();
  const flip=element('div','selected-card'),front=card.createFront();front.classList.add('selected-front');flip.append(front,card.createBack());stage.append(flip);
  markModal(true);workDialog.showModal();
  const origin=wheelCardTransform(card,stage);card.button.style.opacity='0';
  if(!reducedMotion)stage.animate([{transform:origin},{transform:'none'}],{duration:620,easing:'cubic-bezier(.18,.8,.2,1)'});
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!closingWork&&stage.firstElementChild===flip)flip.classList.add('is-flipped');}));
}
async function closeWork(){
  if(!workDialog.open||closingWork)return;closingWork=true;
  const stage=workDialog.querySelector('.selected-card-stage');let closingAnimation;
  if(!reducedMotion){
    const from=getComputedStyle(stage).transform;
    stage.getAnimations().forEach(animation=>animation.cancel());
    const destination=wheelCardTransform(activeCard,stage);
    workDialog.classList.add('is-closing');
    const flip=stage.firstElementChild;
    flip.classList.remove('is-flipped');
    closingAnimation=stage.animate([{transform:from},{transform:destination}],{duration:620,easing:'cubic-bezier(.8,0,.82,.2)',fill:'forwards'});
    await closingAnimation.finished;
  }
  workDialog.close();closingAnimation?.cancel();workDialog.classList.remove('is-closing');markModal(false);
  if(activeCard){activeCard.button.style.opacity='';activeCard.button.focus({preventScroll:true});}
  activeCard=null;closingWork=false;
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
    }else if(media.type==='youtube'||media.type==='youtube-playlist'){
      const button=element('button','video-load');button.append(element('strong','','▷  Watch gameplay'),element('span','','Load YouTube player'));
      button.addEventListener('click',()=>{const frame=element('iframe');frame.title=`${project.title} gameplay`;const path=media.type==='youtube-playlist'?`videoseries?list=${encodeURIComponent(media.id)}`:encodeURIComponent(media.id);frame.src=`https://www.youtube-nocookie.com/embed/${path}`;frame.allow='fullscreen; picture-in-picture';frame.allowFullscreen=true;gallery.replaceChild(frame,button);});gallery.append(button);
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
new SkillField(document.querySelector('#skills-field'),skills,{reducedMotion});
new SpaceBackground(document.querySelector('#stars'));

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

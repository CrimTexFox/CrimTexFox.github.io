import * as THREE from './assets/three.module.js';
const orange=0xffb045;
const mat=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
function mesh(geometry,material,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;}
function cube(parent,size,pos,color){return mesh(new THREE.BoxGeometry(...size),typeof color==='number'?mat(color):color,parent,...pos);}
function cylinder(parent,radius,height,pos,color){return mesh(new THREE.CylinderGeometry(radius,radius,height,24),mat(color),parent,...pos);}
function sphere(parent,radius,pos,color){return mesh(new THREE.SphereGeometry(radius,20,14),mat(color),parent,...pos);}
function wire(parent,points,color,radius=.022){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,radius,7,false),mat(color),parent);}
function labelTexture(project){
  const c=document.createElement('canvas');c.width=512;c.height=320;const ctx=c.getContext('2d');
  ctx.fillStyle=project.theme==='horror'?'#29231e':'#c28d50';ctx.fillRect(0,0,512,320);
  // Paper grain is procedural and ships with the model.
  for(let i=0;i<4500;i++){ctx.fillStyle=i%2?'#ffffff07':'#00000007';ctx.fillRect((i*149)%512,(i*83)%320,1.5,1.5);}
  ctx.strokeStyle='#e9d5ac70';ctx.lineWidth=2;
  ctx.fillStyle=project.theme==='horror'?'#ffb045':'#30251a';ctx.textAlign='center';ctx.font='31px "STIX Two Math",serif';ctx.fillText(project.title,256,184);
  ctx.font='13px "STIX Two Math",serif';ctx.fillText(project.theme==='robot'?'HARDWARE / 01':project.theme==='horror'?'HANDLE WITH FEAR':project.theme==='drawensic'?'DRAW / SIGN / DISCOVER':'A WORLD IN PROGRESS',256,221);
  ctx.save();ctx.translate(256,94);
  if(project.theme==='robot'){
    ctx.lineWidth=3;ctx.strokeRect(-22,-22,44,44);for(let i=-14;i<=14;i+=14){for(let sign of [-1,1]){ctx.beginPath();ctx.moveTo(sign*22,i);ctx.lineTo(sign*31,i);ctx.stroke();ctx.beginPath();ctx.moveTo(i,sign*22);ctx.lineTo(i,sign*31);ctx.stroke();}}
  }else if(project.theme==='cat'){
    ctx.beginPath();ctx.moveTo(-28,19);ctx.lineTo(-28,-23);ctx.lineTo(-8,-8);ctx.quadraticCurveTo(0,-14,8,-8);ctx.lineTo(28,-23);ctx.lineTo(28,19);ctx.quadraticCurveTo(0,42,-28,19);ctx.fill();
  }else if(project.theme==='drawensic'){
    ctx.lineWidth=3;ctx.strokeStyle='#30251a';ctx.strokeRect(-36,-22,72,49);ctx.beginPath();ctx.moveTo(-36,-10);ctx.lineTo(36,-10);ctx.stroke();ctx.beginPath();ctx.moveTo(-16,15);ctx.lineTo(14,-4);ctx.lineTo(20,2);ctx.lineTo(-10,21);ctx.closePath();ctx.fill();
  }else{
    ctx.strokeStyle='#ffb045';ctx.lineWidth=4;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*15+10,-29);ctx.lineTo(i*15-10,27);ctx.stroke();}
  }
  ctx.restore();const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function controller(parent,x,z,color=0x242529){
  const g=new THREE.Group();g.position.set(x,.23,z);g.rotation.y=-.22;g.rotation.x=-.1;g.scale.setScalar(.9);parent.add(g);
  const shape=new THREE.Shape();shape.moveTo(-.48,.17);shape.bezierCurveTo(-.65,.17,-.8,-.4,-.57,-.43);shape.bezierCurveTo(-.43,-.47,-.32,-.18,-.21,-.18);shape.lineTo(.21,-.18);shape.bezierCurveTo(.32,-.18,.43,-.47,.57,-.43);shape.bezierCurveTo(.8,-.4,.65,.17,.48,.17);shape.quadraticCurveTo(0,.31,-.48,.17);
  const body=mesh(new THREE.ExtrudeGeometry(shape,{depth:.15,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.06,bevelThickness:.055}),mat(color),g);body.rotation.x=-Math.PI/2;
  for(const [px,pz] of [[-.32,-.04],[.17,.2]]){cylinder(g,.115,.08,[px,.19,pz],0x111113);cylinder(g,.085,.06,[px,.24,pz],0x47474b);}
  cube(g,[.21,.04,.065],[-.3,.2,.22],0xb3b2ad);cube(g,[.065,.04,.21],[-.3,.2,.22],0xb3b2ad);
  for(const [px,pz]of [[.34,-.1],[.46,.02],[.34,.14],[.22,.02]])cylinder(g,.039,.025,[px,.21,pz],orange);
  cylinder(g,.035,.018,[0,.22,-.09],0xe5e1d6);return g;
}
function pi(parent){
  const g=new THREE.Group();g.position.set(-1.22,.13,.85);g.rotation.y=-.22;parent.add(g);
  cube(g,[.86,.065,.59],[0,0,0],0x345f43);
  cube(g,[.24,.075,.24],[.05,.07,0],0x222727);cube(g,[.25,.08,.13],[-.2,.07,.12],0x111315);
  for(const x of [.19,.4])cube(g,[.19,.19,.2],[x,.1,-.24],0xa5a5a1);
  cube(g,[.21,.16,.22],[-.3,.09,-.23],0xa3a5a1);
  for(let i=0;i<12;i++)cube(g,[.023,.10,.035],[-.34+i*.057,.07,.23],0xceb173);
  for(const x of [-.34,.34])for(const z of [-.2,.2])cylinder(g,.035,.008,[x,.039,z],0xd9b96b);
  return g;
}
function breadboard(parent){
  const g=new THREE.Group();g.position.set(.92,.1,1.08);g.rotation.y=.2;parent.add(g);
  cube(g,[.64,.11,.9],[0,0,0],0xe9e2d3);
  for(let r=0;r<11;r++)for(let col=0;col<6;col++)cylinder(g,.012,.005,[-.23+col*.09,.058,-.35+r*.066],0x777975);
  cube(g,[.008,.004,.7],[-.28,.06,0],orange);cube(g,[.008,.004,.7],[.28,.06,0],0x696b70);
}
function roboticArm(parent){
  const g=new THREE.Group();g.position.set(1.22,.12,-.45);g.rotation.y=-.5;parent.add(g);
  const gray=mat(0x777a79,.45,.45),dark=mat(0x242728,.6,.4);
  cylinder(g,.28,.15,[0,.08,0],0x383b3b);cylinder(g,.17,.16,[0,.2,0],orange);
  const lower=cube(g,[.16,.65,.19],[.13,.57,0],gray);lower.rotation.z=-.42;
  sphere(g,.15,[.26,.89,0],orange);
  const upper=cube(g,[.15,.62,.17],[.08,1.12,0],gray);upper.rotation.z=.62;
  sphere(g,.12,[-.1,1.38,0],0xffb045);
  const wrist=cube(g,[.13,.33,.14],[-.25,1.47,0],dark);wrist.rotation.z=1;
  for(const z of [-.085,.085]){const claw=cube(g,[.22,.07,.045],[-.45,1.53,z],gray);claw.rotation.y=z<0?-.4:.4;}
  wire(g,[[0,.25,.13],[.28,.62,.13],[.25,.9,.13],[-.1,1.35,.13],[-.4,1.5,.06]],0x151617,.026);return g;
}
function cat(parent){
  const g=new THREE.Group();g.position.set(.92,.13,.72);g.rotation.y=-.28;parent.add(g);
  const white=0xd5c9b2;
  const body=sphere(g,.24,[0,.25,0],white);body.scale.set(.9,1.3,.8);
  sphere(g,.24,[0,.65,.01],white);
  for(const x of [-.15,.15]){
    const ear=mesh(new THREE.ConeGeometry(.12,.24,3),mat(white),g,x,.88,.02);ear.rotation.y=Math.PI/2;
    sphere(g,.023,[x*.65,.68,.23],0x1c1b1a);sphere(g,.06,[x,.07,.11],white);
  }
  sphere(g,.022,[0,.6,.245],0x9d714d);
  wire(g,[[.14,.2,-.1],[.37,.24,-.15],[.47,.53,-.13],[.38,.64,-.11]],white,.047);
  return g;
}
function key(parent,x,z,rotation){
  const g=new THREE.Group();g.position.set(x,.13,z);g.rotation.y=rotation;parent.add(g);
  const ring=mesh(new THREE.TorusGeometry(.12,.035,8,24),mat(0xd7ac64,.4,.5),g);ring.rotation.x=Math.PI/2;
  cube(g,[.065,.05,.35],[0,0,.25],0xd7ac64);cube(g,[.14,.05,.055],[.04,0,.38],0xd7ac64);
}
function drawingTablet(parent){
  const group=new THREE.Group();group.position.set(-1.05,.17,.96);group.rotation.y=-.2;parent.add(group);
  cube(group,[1.02,.09,.75],[0,0,0],0x303033);
  const canvas=document.createElement('canvas');canvas.width=360;canvas.height=240;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#f1e9d7';ctx.fillRect(0,0,360,240);ctx.fillStyle='#29282a';ctx.fillRect(0,0,360,30);
  for(let i=0;i<3;i++){ctx.fillStyle=i===0?'#ffb045':'#aaa396';ctx.beginPath();ctx.arc(15+i*14,15,4,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='#ad7834';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.arc(180,139,59,0,Math.PI*2);ctx.moveTo(149,123);ctx.lineTo(152,123);ctx.moveTo(208,123);ctx.lineTo(211,123);ctx.moveTo(152,153);ctx.quadraticCurveTo(180,182,210,153);ctx.stroke();
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const screen=mesh(new THREE.PlaneGeometry(.91,.63),new THREE.MeshBasicMaterial({map:texture}),group,0,.051,0);screen.rotation.x=-Math.PI/2;
  const pencil=new THREE.Group();pencil.position.set(.68,.04,.05);pencil.rotation.z=-.25;pencil.rotation.x=Math.PI/2;group.add(pencil);
  cylinder(pencil,.035,.73,[0,0,0],orange);mesh(new THREE.ConeGeometry(.035,.14,12),mat(0xe1ca9e),pencil,0,.435,0);
  return group;
}
function contactShadow(){
  const c=document.createElement('canvas');c.width=128;c.height=128;const ctx=c.getContext('2d');
  const gradient=ctx.createRadialGradient(64,64,6,64,64,64);gradient.addColorStop(0,'rgba(0,0,0,.6)');gradient.addColorStop(.45,'rgba(0,0,0,.28)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  return new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false});
}
// Panels meet at their edges. Overlapping outer faces cause z-fighting on hover.
export function buildBoxShell(parent,{cardboard,inside,front}){
  const panels=[
    cube(parent,[1.85,.1,1.4],[0,.05,0],inside),
    cube(parent,[2,1.05,.07],[0,.55,-.74],cardboard),
    cube(parent,[.07,1.05,1.41],[-.965,.55,0],cardboard),
    cube(parent,[.07,1.05,1.41],[.965,.55,0],cardboard),
    cube(parent,[2,1.05,.07],[0,.55,.74],[cardboard,cardboard,cardboard,cardboard,front,cardboard])
  ];
  return panels;
}

// A reusable real 3D model. New project entries automatically get a matching box.
export class ProjectBox {
  constructor(container,project,onOpen,reducedMotion=false){
    this.project=project;this.reducedMotion=reducedMotion;this.open=0;this.targetOpen=0;this.hover=0;this.targetHover=0;this.frame=null;this.inView=false;
    this.button=document.createElement('button');this.button.className='project-button';this.button.type='button';this.button.setAttribute('aria-label',`Open ${project.title}`);this.button.setAttribute('aria-haspopup','dialog');
    this.host=document.createElement('div');this.host.className='project-scene';this.host.setAttribute('aria-hidden','true');
    const title=document.createElement('h3');title.textContent=project.title;const kind=document.createElement('p');kind.className='project-kind';kind.textContent=project.kind;this.button.append(this.host,title,kind);container.append(this.button);
    try{this.build();}catch(e){this.host.replaceChildren();const fallback=document.createElement('div');fallback.className='scene-fallback';this.host.append(fallback);console.warn('WebGL model fallback',e);}
    this.button.addEventListener('click',()=>onOpen(this));
    for(const event of ['pointerenter','focus'])this.button.addEventListener(event,()=>{this.targetHover=1;this.animate();});
    for(const event of ['pointerleave','blur'])this.button.addEventListener(event,()=>{this.targetHover=0;this.animate();});
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.host);
    this.visibilityObserver=new IntersectionObserver(entries=>{this.inView=entries[0].isIntersecting;if(this.inView)this.animate();},{rootMargin:'120px'});this.visibilityObserver.observe(this.host);
  }
  build(){
    this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    // Soft contact shadow only: moving thin cardboard must not self-shadow.
    this.renderer.shadowMap.enabled=false;
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.4;this.host.append(this.renderer.domElement);
    this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(32,1,.1,40);this.camera.position.set(4.1,3.15,5.8);this.camera.lookAt(0,.72,0);
    this.scene.add(new THREE.HemisphereLight(0xfff1d8,0x3e4049,3));
    const light=new THREE.DirectionalLight(0xffe0ac,4.5);light.position.set(-3,7,5);this.scene.add(light);
    const rim=new THREE.DirectionalLight(0xc6d7ed,2);rim.position.set(4,3,-4);this.scene.add(rim);
    const ground=mesh(new THREE.PlaneGeometry(5,4),contactShadow(),this.scene,0,-.02,0);ground.rotation.x=-Math.PI/2;ground.renderOrder=-1;
    this.group=new THREE.Group();this.group.rotation.y=-.19;this.scene.add(this.group);
    const cardboard=mat(this.project.color),inside=mat(this.project.theme==='horror'?0x24201b:0x91653b);
    const box=new THREE.Group();this.group.add(box);box.position.set(0,.1,0);
    const labelMat=new THREE.MeshStandardMaterial({map:labelTexture(this.project),roughness:.92});
    buildBoxShell(box,{cardboard,inside,front:labelMat});
    // Lid geometry is hinged to the rear edge, not translated out of the box.
    this.hinge=new THREE.Group();this.hinge.position.set(0,1.12,-.79);box.add(this.hinge);
    cube(this.hinge,[2.08,.095,1.64],[0,.02,.8],cardboard);
    cube(this.hinge,[.32,.008,1.65],[0,.08,.8],mat(this.project.theme==='horror'?0x332c23:0xd8b77b));
    for(const x of [-.75,.75])cube(box,[.04,.75,.005],[x,.55,.781],mat(0x302619));
    if(this.project.theme==='robot'){
      pi(this.group);breadboard(this.group);roboticArm(this.group);
      wire(this.group,[[-1.25,.22,1],[-.85,.45,1.2],[.2,.15,1.37],[.8,.18,1.2]],orange);
      wire(this.group,[[-1.1,.23,.93],[-1.0,.36,1.31],[.1,.22,1.5],[1,.17,1.1]],0xc9c4b7,.017);
    }else if(this.project.theme==='horror'){
      controller(this.group,-.85,1.1);key(this.group,.9,1.05,-.5);key(this.group,1.25,.5,.5);
    }else if(this.project.theme==='drawensic'){
      drawingTablet(this.group);const pad=controller(this.group,1.12,.95,0xc8c4b8);pad.scale.setScalar(.65);
    }else{controller(this.group,-.85,1.05,0xc8c4b8);cat(this.group);}
    this.resize();
  }
  resize(){
    if(!this.renderer)return;const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;
    this.renderer.setSize(w,h,false);this.camera.aspect=w/h;
    this.camera.position.set(4.1,3.15,5.8);if(w/h<.9)this.camera.position.multiplyScalar(1.12);this.camera.lookAt(0,.72,0);this.camera.updateProjectionMatrix();this.render();
  }
  render(){if(this.renderer&&this.hinge){this.hinge.rotation.x=-this.open*1.85;this.group.rotation.y=-.19+this.hover*.065;this.group.position.y=this.hover*.065;this.group.scale.setScalar(1+this.hover*.045);this.renderer.render(this.scene,this.camera);}}
  setOpen(open){this.targetOpen=open?1:0;this.animate();}
  animate(){
    if(!this.renderer||this.frame)return;
    if(this.reducedMotion){this.open=this.targetOpen;this.hover=this.targetHover;this.render();return;}
    let last=performance.now();const tick=now=>{
      const dt=Math.min((now-last)/1000,.04);last=now;const ease=1-Math.exp(-10*dt);
      this.open+=(this.targetOpen-this.open)*ease;this.hover+=(this.targetHover-this.hover)*ease;this.render();
      if(Math.abs(this.open-this.targetOpen)>.001||Math.abs(this.hover-this.targetHover)>.001)this.frame=requestAnimationFrame(tick);
      else{this.open=this.targetOpen;this.hover=this.targetHover;this.render();this.frame=null;}
    };this.frame=requestAnimationFrame(tick);
  }
}

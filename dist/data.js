// Add an object to either array to create another card or project box.
export const experiences = [
  {company:'OpenAI',division:'Consumer Products',role:'Software Engineer Intern',dates:'Jun 2026 – Sep 2026',year:'2026',mark:'openai',suit:'♠',url:'https://openai.com',points:[
    'Developed embedded and application software in C, Rust, and Python on Linux.',
    'Worked on color spaces, ambient light sensing, and Raspberry Pi computer vision with OpenCV.',
    'Built test dashboards and automated checks; investigated bugs and verified changes.',
    'Used 3D printing for iterative prototypes and documented development workflows.'
  ],tech:['C','Rust','Python','Linux','Raspberry Pi','OpenCV']},
  {company:'Commissary Club',role:'Software Engineer Intern',dates:'Dec 2025 – Mar 2026',year:'2025',mark:'commissary',suit:'♦',url:'https://www.commissary.club',points:[
    'Maintained and improved frontend and backend features for a platform helping people with criminal records find employment and housing.',
    'Evaluated AI assistant efficiency and improved interactions, prompts, and data collection and delivery.'
  ],tech:['Python','JavaScript','MySQL','Supabase']},
  {company:'inCall.ai',role:'Software Engineer Intern',dates:'Mar 2024 – Jun 2024',year:'2024',mark:'incall',suit:'♣',url:'https://incall.ai',points:[
    'Developed a platform connecting interactive AI agents with video conferencing.',
    'Enabled a call bot to join Zoom meetings and interact with participants.',
    'Integrated OpenAI, Microsoft Teams, and Zoom APIs.'
  ],tech:['Python','OpenAI API','Microsoft Teams API','Zoom API']},
  {company:'PCB BOM Recognition',role:'Software Engineer Intern',dates:'Oct 2023 – Dec 2023',year:'2023',mark:'pcb',suit:'♥',points:[
    'Built a prototype to identify and extract text from motherboard images for PCB bill-of-materials mapping.',
    'Trained image recognition models with Python, OCR, and open-source tools including ocrSpace and YOLOv8.'
  ],tech:['Python','OCR','Computer vision','YOLOv8']},
  {company:'SV Stem Lab',role:'Robotics Coach',dates:'Feb 2023 – Aug 2025',year:'2023',mark:'stem',suit:'♠',points:[
    'Taught students robotics and programming with VEXcode and Python.',
    'Formed and coached a middle school VEX IQ competition team that achieved top U.S. rankings in one season.'
  ],tech:['VEX IQ','VEXcode','Python','Mentoring']}
];
export const projects = [
  {id:'robot-arm',title:'AI Robotic Arm',kind:'Robotics · Early development',theme:'robot',color:0xc78f4b,boxImage:'./assets/box-photos/robot-arm.webp',
    description:'An early-stage project exploring a four-axis robotic arm with a companion AI. I’m currently studying and planning the base OS and foundational software design.',
    points:['Long-term direction: computer vision and context-aware companion behavior on Raspberry Pi.'],
    timeline:[
      {phase:'Earlier',title:'Hardware exploration',description:'Initial hardware setup and dashboard experiments.'},
      {phase:'Now · Early development',title:'Study & software planning',description:'Studying the base OS and planning the foundational software architecture.',current:true},
      {phase:'Planned',title:'Core implementation',description:'Build on the study and design phase to implement the software foundation.'}
    ],
    tech:['Raspberry Pi','OpenCV','OpenAI Realtime API','Linux','Python','C','Rust'],links:[],galleryLayout:'grid',media:[
      {type:'image',src:'./assets/robot-arm/setup.webp',alt:'Robotic arm beside the Raspberry Pi display and companion enclosure'},
      {type:'image',src:'./assets/robot-arm/console.webp',alt:'Companion console and assembled camera and speaker enclosure'},
      {type:'image',src:'./assets/robot-arm/arm.webp',alt:'Full robotic arm and companion hardware on the workbench'},
      {type:'image',src:'./assets/robot-arm/wiring.webp',alt:'Raspberry Pi, camera ribbons, and companion wiring during assembly'},
      {type:'image',src:'./assets/robot-arm/displays.webp',alt:'Companion face display and camera dashboard during development'},
      {type:'video',src:'./assets/robot-arm/demo.mp4',poster:'./assets/robot-arm/demo-poster.jpg',alt:'Robot arm demonstration'}
    ]},
  {id:'dont-hide',title:'Don’t Hide',kind:'Horror game · Published',theme:'horror',color:0x695743,boxImage:'./assets/box-photos/dont-hide.webp',
    description:'An independent horror game I conceived, designed, developed, and published on Steam. Trapped in a maze with a creature, you have to find five keys and escape before it catches your scent.',
    points:['Designed and built the game from concept through release.','More than 1,000 licenses granted.'],
    tech:['Godot','Python','Aseprite','Audacity'],links:[{label:'Play on Steam',url:'https://store.steampowered.com/app/2131620/Dont_Hide/'}],
    media:[{type:'image',src:'./assets/dont-hide-1.jpg',alt:'Don’t Hide gameplay screenshot from the Steam store'},{type:'image',src:'./assets/dont-hide-2.jpg',alt:'A dark maze in Don’t Hide'}]},
  {id:'cat-rpg',title:'Cat RPG',kind:'3D game · Prototype',theme:'cat',color:0x9a6740,boxImage:'./assets/box-photos/cat-rpg.webp',
    description:'A 3D role-playing game prototype about escaping a city overrun by cats. I programmed and designed the game, collaborating with an artist on its world and visual direction.',
    points:['Programmed the game systems and 3D prototype in Godot.','Collaborated with an artist on game design and development.'],
    tech:['Godot','Python','Procreate','Audacity'],links:[{label:'Watch gameplay',url:'https://www.youtube.com/watch?v=WFFjuH0PtXI'}],
    media:[{type:'youtube',id:'WFFjuH0PtXI',autoLoad:true}]},
  {id:'drawensic',title:'Drawensic',kind:'Drawing game · Website',theme:'drawensic',color:0xbb8b50,boxImage:'./assets/box-photos/drawensic.webp',
    description:'A browser game where you draw a video game character from a written description, sign your artwork, and then discover who it was. A shared gallery lets you explore the community’s interpretations.',
    points:['Canvas drawing tools with brushes, fill, eraser, and undo/redo.','Signed artwork, framed downloads, and a shared community gallery.'],
    tech:['JavaScript','HTML Canvas','Node.js','Cloudflare Workers','D1','R2'],
    links:[{label:'Play Drawensic',url:'https://drawensic.com'}],media:[{type:'image',src:'./assets/drawensic-home.jpg',alt:'Drawensic homepage with its drawing game and community gallery'}]}
];

export const artworks = [
  {src:'./assets/art/hand-mirror.png',alt:'Line drawing of a hand holding a hanging mirror',paper:'#fff'},
  {src:'./assets/art/gecko.webp',alt:'Green gecko lifting an oversized card in a room',paper:'#ede4c7'},
  {src:'./assets/art/forest-creature.webp',alt:'Orange and cream creature in a dark red forest',paper:'#170b14'}
];

// Every skill is its own capsule object. Optional mass controls how easily it moves.
export const skills = [
  {label:'Python'},{label:'Java'},{label:'C++'},{label:'JavaScript'},{label:'C'},{label:'Rust'},
  {label:'Linux'},{label:'Godot'},{label:'MySQL'},{label:'Supabase'},{label:'OpenCV'},{label:'Raspberry Pi'},
  {label:'Machine learning'},{label:'Computer vision'},{label:'OCR'},{label:'YOLO'},{label:'OpenAI API'},{label:'Realtime API'},
  {label:'Teams API'},{label:'Zoom API'},{label:'Codex'},{label:'Claude'},{label:'Aseprite'},{label:'Audacity'},
  {label:'Procreate'},{label:'VEXcode'},{label:'VEX IQ'},{label:'3D printing'},{label:'HCI'},{label:'UI design'},
  {label:'Robotics'},{label:'Digital art'}
];

import {readFile,access,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const {projects,experiences,skills}=await import('../dist/data.js');
for(const entry of [...projects,...experiences])assert.ok(entry.company||entry.title);
for(const project of projects){
  if(project.boxImage)await access(path.join(root,'dist',project.boxImage));
  for(const media of project.media||[]){if(media.src)await access(path.join(root,'dist',media.src));if(media.poster)await access(path.join(root,'dist',media.poster));}
}
for(const file of await readdir(path.join(root,'dist'))){if(file.endsWith('.js')){const r=spawnSync(process.execPath,['--check',path.join(root,'dist',file)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);}}
const font=await readFile(path.join(root,'dist/assets/stix-two-math.woff2'));assert.equal(font.subarray(0,4).toString(),'wOF2','Font must be actual WOFF2');
for(const name of ['index.html','styles.css','updates.css','skills.js','capsule-physics.js','space-background.js','assets/three.module.js','assets/three.core.js','assets/openai.svg','assets/incall.png','assets/robot-setup.svg'])await access(path.join(root,'dist',name));
const html=await readFile(path.join(root,'dist/index.html'),'utf8');assert.ok(!/rel=["'](?:shortcut )?icon/.test(html),'No website icon requested');
assert.equal(new Set(skills.map(s=>s.label)).size,skills.length,'Skill labels must be unique');
console.log(`Checked ${experiences.length} experience cards, ${projects.length} projects, ${skills.length} skills, module syntax, local media, and font.`);

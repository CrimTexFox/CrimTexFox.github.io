import test from 'node:test';
import assert from 'node:assert/strict';
import {Group,Box3,MeshBasicMaterial} from '../dist/assets/three.module.js';
import {buildBoxShell} from '../dist/project-box.js';
test('cardboard panels do not overlap and create coplanar surface flicker',()=>{
  const group=new Group(),material=new MeshBasicMaterial();
  const panels=buildBoxShell(group,{cardboard:material,inside:material,front:material});group.updateMatrixWorld(true);
  const bounds=panels.map(panel=>new Box3().setFromObject(panel));
  assert.equal(panels.length,5);
  for(let i=0;i<bounds.length;i++)for(let j=i+1;j<bounds.length;j++){
    const a=bounds[i],b=bounds[j];
    const overlap=['x','y','z'].map(axis=>Math.max(0,Math.min(a.max[axis],b.max[axis])-Math.max(a.min[axis],b.min[axis])));
    assert.ok(overlap.reduce((a,b)=>a*b,1)<1e-8,`panels ${i} and ${j} overlap`);
  }
});

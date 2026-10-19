'use strict';
const fs=require('node:fs'),path=require('node:path');
// Only paths under a user-approved workspace; no symlinks or traversal.
function createFolder(root,relative){
 if(typeof root!=='string'||!root)throw new TypeError('Workspace root required.');
 if(typeof relative!=='string'||!relative||relative.includes('\0')||relative.includes('\\')||path.isAbsolute(relative)||/^[A-Za-z]:/.test(relative))throw new TypeError('Invalid folder name.');
 const pieces=relative.split('/');
 if(pieces.some(p=>!p||p==='.'||p==='..'||p.includes(':')))throw new TypeError('Unsafe folder name.');
 const canonicalRoot=fs.realpathSync(root);
 if(!fs.statSync(canonicalRoot).isDirectory())throw new Error('Workspace unavailable.');
 let parent=canonicalRoot;
 for(const segment of pieces.slice(0,-1)){
  const sub=path.join(parent,segment);
  const st=fs.lstatSync(sub);
  if(st.isSymbolicLink()||!st.isDirectory())throw new Error('Invalid parent directory.');
  parent=sub;
 }
 const last=pieces[pieces.length-1];
 const target=path.join(parent,last);
 const relativeTarget=path.relative(canonicalRoot,target);
 if(relativeTarget==='..'||relativeTarget.startsWith('..'+path.sep)||path.isAbsolute(relativeTarget))throw new Error('Path escapes selected workspace.');
 fs.mkdirSync(target,{recursive:false,mode:0o700});
 return {ok:true,path:relative};
}
module.exports={createFolder};

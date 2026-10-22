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
function duplicateFile(root,source,destination){
 if(typeof source!=='string'||typeof destination!=='string')throw new TypeError('Invalid file names.');
 function checked(relative,exists){
  if(!relative||relative.includes('\\')||relative.includes('\0')||path.isAbsolute(relative)||/^[A-Za-z]:/.test(relative))throw new TypeError('Invalid relative path.');
  const parts=relative.split('/');
  if(parts.some(p=>!p||p==='.'||p==='..'||p.includes(':')))throw new TypeError('Unsafe path.');
  const canonicalRoot=fs.realpathSync(root);
  let current=canonicalRoot;
  for(const [i,segment] of parts.entries()){
   current=path.join(current,segment);
   if(i<parts.length-1||exists){
    const st=fs.lstatSync(current);
    if(st.isSymbolicLink()||(i<parts.length-1&&!st.isDirectory()))throw new Error('Symlinks are not allowed.');
    if(i===parts.length-1&&!st.isFile())throw new Error('Source must be a regular file.');
   }
  }
  return current;
 }
 const from=checked(source,true),to=checked(destination,false);
 if(from===to)throw new Error('Source and destination cannot match.');
 const stats=fs.statSync(from);
 if(stats.size>512*1024*1024)throw new Error('Files above 512 MB must be copied externally.');
 fs.copyFileSync(from,to,fs.constants.COPYFILE_EXCL);
 return{ok:true,path:destination};
}
// File-only rename: hard-link new name with exclusive creation, then
// unlink old name. Never overwrite an existing target on macOS/Windows.
// If unlink fails, leave both names intact instead of risking data loss.
function renameFile(root,source,destination){
 if(typeof source!=='string'||typeof destination!=='string')throw new TypeError('Invalid file names.');
 function resolveFile(relative,sourceExists){
  if(!relative||relative.includes('\\')||relative.includes('\0')||path.isAbsolute(relative)||/^[A-Za-z]:/.test(relative))throw new TypeError('Invalid relative path.');
  const parts=relative.split('/');
  if(parts.some(p=>!p||p==='.'||p==='..'||p.includes(':')))throw new TypeError('Unsafe path.');
  let current=fs.realpathSync(root);
  for(const [i,segment] of parts.entries()){
   current=path.join(current,segment);
   if(i<parts.length-1||sourceExists){
    const st=fs.lstatSync(current);
    if(st.isSymbolicLink()||(i<parts.length-1&&!st.isDirectory()))throw new Error('Symlinks are not allowed.');
    if(i===parts.length-1&&!st.isFile())throw new Error('Source must be a regular file.');
   }
  }
  return current;
 }
 const from=resolveFile(source,true),to=resolveFile(destination,false);
 if(from===to)throw new Error('Source and destination cannot match.');
 fs.linkSync(from,to);
 fs.unlinkSync(from);
 return{ok:true,path:destination};
}
// Called only after the main-process workspace resolver validates the target.
// Exclusive creation prevents accidental truncation, including symlink targets.
function createEmptyTextExclusive(target){
 fs.writeFileSync(target,'',{flag:'wx',mode:0o600});
 return {ok:true};
}
module.exports={createFolder,duplicateFile,renameFile,createEmptyTextExclusive};

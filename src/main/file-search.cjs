'use strict';
// Bounded, on-demand filename search. Never index user files or read file content.
const fs=require('node:fs/promises'),path=require('node:path');
const defaults=Object.freeze({limit:30,maxEntries:3000,maxDepth:5});
function inside(root,target){
 const relative=path.relative(root,target);
 return relative!==''&&relative!=='..'&&!relative.startsWith('..'+path.sep)&&!path.isAbsolute(relative);
}
async function findFileNames(root,query,options={}){
 if(typeof root!=='string'||!root)throw new TypeError('Workspace required.');
 if(typeof query!=='string'||query.trim().length<2||query.length>100||query.includes('\0'))
  throw new TypeError('Search query must have 2–100 characters.');
 const limit=options.limit??defaults.limit,maxEntries=options.maxEntries??defaults.maxEntries,maxDepth=options.maxDepth??defaults.maxDepth;
 if(!Number.isInteger(limit)||limit<1||limit>50||!Number.isInteger(maxEntries)||maxEntries<1||maxEntries>10000||!Number.isInteger(maxDepth)||maxDepth<0||maxDepth>8)
  throw new TypeError('Invalid search limits.');
 const canonicalRoot=await fs.realpath(root);
 const rootStat=await fs.lstat(canonicalRoot);
 if(!rootStat.isDirectory())throw new Error('Workspace is not a directory.');
 const needle=query.trim().toLocaleLowerCase('de-DE');
 const queue=[{dir:canonicalRoot,depth:0}];
 const matches=[];let visited=0,truncated=false;
 while(queue.length){
  const {dir,depth}=queue.shift();
  let actual;try{actual=await fs.realpath(dir)}catch{continue}
  if(actual!==canonicalRoot&&!inside(canonicalRoot,actual))continue;
  let entries;try{entries=await fs.readdir(dir,{withFileTypes:true})}catch{continue}
  entries.sort((a,b)=>a.name.localeCompare(b.name,'de-DE',{numeric:true,sensitivity:'base'}));
  for(const entry of entries){
   if(visited++>=maxEntries){truncated=true;break}
   if(entry.name.startsWith('.')||entry.name==='Thumbs.db'||entry.isSymbolicLink())continue;
   if(!entry.isDirectory()&&!entry.isFile())continue;
   const full=path.join(dir,entry.name);
   let stat;try{stat=await fs.lstat(full)}catch{continue}
   if(stat.isSymbolicLink()||(!stat.isDirectory()&&!stat.isFile()))continue;
   const relative=path.relative(canonicalRoot,full);
   if(!inside(canonicalRoot,full))continue;
   const uiPath=relative.split(path.sep).join('/');
   if(entry.name.toLocaleLowerCase('de-DE').includes(needle)){
    matches.push(Object.freeze({name:entry.name,path:uiPath,kind:stat.isDirectory()?'folder':'file'}));
    if(matches.length>=limit){truncated=true;break}
   }
   if(stat.isDirectory()&&depth<maxDepth)queue.push({dir:full,depth:depth+1});
  }
  if(truncated)break;
 }
 return Object.freeze({items:Object.freeze(matches),truncated,scanned:Math.min(visited,maxEntries)});
}
module.exports={findFileNames};

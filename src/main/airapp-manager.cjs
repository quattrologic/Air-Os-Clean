'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {verifyPackage}=require('./airapp-package.cjs');
const CATALOG=Object.freeze({'com.airos.demo.timer':'demo-timer.airapp'});
const maximum=8*1024*1024;
function createManager({root,appPath,publicKeys}){
 if(typeof root!=='function'||typeof appPath!=='function')throw new TypeError('Paths must be functions.');
 function profile(user){
  if(typeof user!=='string'||!user||user.length>80)throw new TypeError('Invalid user.');
  const key=crypto.createHash('sha256').update(user.toLowerCase()).digest('hex');
  return path.join(root(),'profiles',key,'airapps');
 }
 function manifestFor(id){
  if(!Object.prototype.hasOwnProperty.call(CATALOG,id))throw new Error('App is not in trusted local catalog.');
  const src=path.join(appPath(),'store','catalog',CATALOG[id]);
  if(fs.statSync(src).size>maximum)throw new Error('Catalog package too large.');
  const pkg=JSON.parse(fs.readFileSync(src,'utf8'));
  if(pkg.signer!=='demo'||!publicKeys.demo)throw new Error('Unknown package signer.');
  const verified=verifyPackage(pkg,publicKeys.demo);
  if(verified.manifest.id!==id)throw new Error('Package identity mismatch.');
  if(!verified.manifest.platforms.includes(process.platform))throw new Error('Incompatible platform.');
  return verified;
 }
 function catalog(){
  return Object.keys(CATALOG).map(id=>{
   try{const {manifest:m}=manifestFor(id);return{id:m.id,name:m.name,description:m.description,version:m.version,author:m.author,permissions:m.permissions,compatible:true}}
   catch(error){return{id,compatible:false,error:error.message}}
  });
 }
 function indexFile(user){return path.join(profile(user),'installed-v1.json')}
 function installed(user){
  try{
   const data=JSON.parse(fs.readFileSync(indexFile(user),'utf8'));
   if(!Array.isArray(data.apps))throw new Error('Installed apps index corrupt.');
   return data.apps.map(a=>({...a}));
  }catch(error){if(error.code==='ENOENT')return [];throw error}
 }
 function persist(user,apps){
  const file=indexFile(user);fs.mkdirSync(path.dirname(file),{recursive:true});
  const tmp=file+'.'+crypto.randomBytes(6).toString('hex')+'.tmp';
  try{fs.writeFileSync(tmp,JSON.stringify({schemaVersion:1,apps},null,2),{mode:0o600});fs.renameSync(tmp,file)}
  finally{try{fs.unlinkSync(tmp)}catch(error){if(error.code!=='ENOENT')throw error}}
 }
 function install(user,id){
  const {manifest,files}=manifestFor(id);
  const existing=installed(user);
  if(existing.some(a=>a.id===id))return{id,alreadyInstalled:true};
  const base=profile(user);fs.mkdirSync(base,{recursive:true});
  const target=path.join(base,id);
  if(fs.existsSync(target))throw new Error('Installed package directory already exists. Manual recovery needed.');
  const tmp=path.join(base,'.install-'+crypto.randomBytes(8).toString('hex'));
  fs.mkdirSync(tmp,{recursive:true,mode:0o700});
  try{
   for(const [name,bytes]of files){const dst=path.join(tmp,name);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.writeFileSync(dst,bytes,{flag:'wx',mode:0o600})}
   fs.writeFileSync(path.join(tmp,'manifest.airapp.json'),JSON.stringify(manifest),{flag:'wx',mode:0o600});
   fs.renameSync(tmp,target);
   try{persist(user,[...existing,{id,name:manifest.name,version:manifest.version,entry:manifest.entry}])}
   catch(error){fs.rmSync(target,{recursive:true,force:true});throw error}
  }finally{if(fs.existsSync(tmp))fs.rmSync(tmp,{recursive:true,force:true})}
  return{id,alreadyInstalled:false};
 }
 function remove(user,id){
  if(!Object.prototype.hasOwnProperty.call(CATALOG,id))throw new Error('Unknown app ID.');
  const current=installed(user);if(!current.some(a=>a.id===id))throw new Error('Not installed.');
  const target=path.join(profile(user),id);
  // Stage removal by renaming on the same filesystem. Persist the index
  // before deleting the staged app; a failed index write restores the app.
  const base=profile(user);
  if(!fs.existsSync(target))throw new Error('Installed app directory is missing.');
  const stat=fs.lstatSync(target);
  if(!stat.isDirectory()||stat.isSymbolicLink())throw new Error('Invalid installation directory.');
  const staged=path.join(base,'.uninstall-'+crypto.randomBytes(12).toString('hex'));
  fs.renameSync(target,staged);
  try{persist(user,current.filter(a=>a.id!==id))}
  catch(error){fs.renameSync(staged,target);throw error}
  // If deletion fails, keep the quarantined directory for manual recovery.
  // Do not claim app data was fully removed unless deletion succeeds.
  fs.rmSync(staged,{recursive:true,force:true});return{ok:true};
 }
 function installedFolder(user,id){
  if(!Object.prototype.hasOwnProperty.call(CATALOG,id))throw new Error('Unknown app ID.');
  const record=installed(user).find(a=>a.id===id);if(!record)throw new Error('App not installed.');
  // Verify the original signed manifest AND every installed asset again on launch.
  // User-writable files must not silently become unsigned executable content.
  const signed=manifestFor(id),m=signed.manifest;
  if(record.entry!==m.entry||record.version!==m.version||record.name!==m.name)throw new Error('Installed metadata mismatch.');
  const folder=path.join(profile(user),id);
  const realFolder=fs.realpathSync(folder);
  if(!fs.lstatSync(folder).isDirectory()||fs.lstatSync(folder).isSymbolicLink())throw new Error('Invalid installation directory.');
  const copy=JSON.parse(fs.readFileSync(path.join(folder,'manifest.airapp.json'),'utf8'));
  if(JSON.stringify(copy)!==JSON.stringify(m))throw new Error('Installed manifest integrity check failed.');
  for(const {path:name,sha256} of m.files){
   const local=path.join(folder,name);
   const stat=fs.lstatSync(local);
   if(!stat.isFile()||stat.isSymbolicLink())throw new Error('Invalid installed asset.');
   const canonical=fs.realpathSync(local),relative=path.relative(realFolder,canonical);
   if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))throw new Error('Installed asset escapes application folder.');
   if(crypto.createHash('sha256').update(fs.readFileSync(local)).digest('hex')!==sha256)throw new Error('Installed file integrity check failed.');
  }
  return folder;
 }
 return Object.freeze({catalog,installed,install,remove,installedFolder});
}
module.exports={createManager};

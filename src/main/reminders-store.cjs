'use strict';
// Air Reminders: per-user, offline and atomically persisted task data.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const format=require('../core/reminders-format.js');
function createStore({root}){
 if(typeof root!=='function')throw new TypeError('Root function required.');
 function filename(user){
  if(typeof user!=='string'||!user||user.length>80)throw new TypeError('Invalid user.');
  const key=crypto.createHash('sha256').update(user.toLowerCase()).digest('hex');
  return path.join(root(),'profiles',key,'reminders-v1.json');
 }
 function list(user){
  const file=filename(user);
  try{
   const value=JSON.parse(fs.readFileSync(file,'utf8'));
   if(!value||value.schemaVersion!==1||!Array.isArray(value.reminders)||value.reminders.length>300)
    throw new Error('Reminder storage corrupted.');
   return value.reminders.map(item=>({...item}));
  }catch(error){if(error.code==='ENOENT')return [];throw error}
 }
 function persist(user,items){
  const file=filename(user),folder=path.dirname(file);
  fs.mkdirSync(folder,{recursive:true});
  const temp=file+'.'+crypto.randomBytes(8).toString('hex')+'.tmp';
  try{fs.writeFileSync(temp,JSON.stringify({schemaVersion:1,reminders:items},null,2),{flag:'wx',mode:0o600});fs.renameSync(temp,file)}
  finally{try{fs.unlinkSync(temp)}catch(e){if(e.code!=='ENOENT')throw e}}
 }
 function save(user,item){
  const {id}=format.validate(item);
  const items=list(user),index=id?items.findIndex(entry=>entry.id===id):-1;
  if(id&&index<0)throw new Error('Reminder not found.');
  if(index<0&&items.length>=300)throw new Error('Reminder limit reached.');
  const now=new Date().toISOString();
  const entry=format.make(item,index>=0?items[index]:null,now,index<0?crypto.randomUUID():id);
  if(index>=0)items[index]=entry;else items.unshift(entry);
  persist(user,items);return {...entry};
 }
 function remove(user,id){
  if(typeof id!=='string'||!ID.test(id))throw new TypeError('Invalid reminder ID.');
  const items=list(user),keep=items.filter(item=>item.id!==id);
  if(items.length===keep.length)throw new Error('Reminder not found.');
  persist(user,keep);return{ok:true};
 }
 return Object.freeze({list,save,remove});
}
module.exports={createStore};

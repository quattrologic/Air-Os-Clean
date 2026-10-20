'use strict';
// Air Reminders: per-user, offline and atomically persisted task data.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PRIORITIES=new Set(['none','low','medium','high']);
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
  if(!item||typeof item!=='object'||Array.isArray(item))throw new TypeError('Invalid reminder.');
  const {id,title,details='',dueDate=null,priority='none',completed=false}=item;
  if(id!=null&&(typeof id!=='string'||!ID.test(id)))throw new TypeError('Invalid reminder ID.');
  if(typeof title!=='string'||!title.trim()||title.length>140||typeof details!=='string'||details.length>2000)
   throw new TypeError('Invalid reminder text.');
  if(!PRIORITIES.has(priority)||typeof completed!=='boolean')throw new TypeError('Invalid reminder state.');
  if(dueDate!==null&&(typeof dueDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)||Number.isNaN(Date.parse(dueDate))||
   new Date(dueDate+'T12:00:00Z').toISOString().slice(0,10)!==dueDate))throw new TypeError('Invalid due date.');
  const items=list(user),index=id?items.findIndex(entry=>entry.id===id):-1;
  if(id&&index<0)throw new Error('Reminder not found.');
  if(index<0&&items.length>=300)throw new Error('Reminder limit reached.');
  const now=new Date().toISOString();
  const entry={id:index<0?crypto.randomUUID():id,title:title.trim(),details,dueDate,priority,completed,createdAt:index<0?now:items[index].createdAt,updatedAt:now};
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

'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const idPattern=/^[0-9a-f-]{36}$/i;
function createStore({root}){
 if(typeof root!=='function')throw new TypeError('Root function required.');
 function filename(user){
  if(typeof user!=='string'||!user||user.length>80)throw new TypeError('Ungültiger Benutzername.');
  const hash=crypto.createHash('sha256').update(user.toLowerCase()).digest('hex');
  return path.join(root(),'profiles',hash,'notes-v1.json');
 }
 function list(user){
  const file=filename(user);
  try{
   const parsed=JSON.parse(fs.readFileSync(file,'utf8'));
   if(!Array.isArray(parsed.notes))throw new Error('Notizdatei beschädigt.');
   return parsed.notes.map(n=>({...n}));
  }catch(error){if(error.code==='ENOENT')return [];throw error}
 }
 function persist(user,notes){
  const file=filename(user);fs.mkdirSync(path.dirname(file),{recursive:true});
  const tmp=file+'.'+crypto.randomBytes(6).toString('hex')+'.tmp';
  try{fs.writeFileSync(tmp,JSON.stringify({schemaVersion:1,notes},null,2),{mode:0o600});fs.renameSync(tmp,file)}
  finally{try{fs.unlinkSync(tmp)}catch(error){if(error.code!=='ENOENT')throw error}}
 }
 function save(user,input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new TypeError('Ungültige Notiz.');
  const {id,title,body}=input;
  if(id!=null&&(typeof id!=='string'||!idPattern.test(id)))throw new TypeError('Ungültige Notiz-ID.');
  if(typeof title!=='string'||title.length>120||typeof body!=='string'||Buffer.byteLength(body,'utf8')>524288)throw new TypeError('Notiz zu groß oder ungültig.');
  const notes=list(user);const index=id?notes.findIndex(n=>n.id===id):-1;
  if(id&&index<0)throw new Error('Notiz nicht gefunden.');
  if(index<0&&notes.length>=200)throw new Error('Höchstens 200 Notizen erlaubt.');
  const now=new Date().toISOString();
  const note={id:index>=0?id:crypto.randomUUID(),title,body,createdAt:index>=0?notes[index].createdAt:now,updatedAt:now};
  if(index>=0)notes[index]=note;else notes.unshift(note);
  persist(user,notes);return {...note};
 }
 function remove(user,id){
  if(typeof id!=='string'||!idPattern.test(id))throw new TypeError('Ungültige Notiz-ID.');
  const notes=list(user),remaining=notes.filter(n=>n.id!==id);
  if(notes.length===remaining.length)throw new Error('Notiz nicht gefunden.');
  persist(user,remaining);return {ok:true};
 }
 return Object.freeze({list,save,remove});
}
module.exports={createStore};

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createFolder,duplicateFile,renameFile,createEmptyTextExclusive}=require('../src/main/file-ops.cjs');
test('creates a folder only beneath the selected workspace',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-folder-'));
 try{
  fs.mkdirSync(path.join(root,'approved'));
  assert.deepEqual(createFolder(root,'approved/New Folder'),{ok:true,path:'approved/New Folder'});
  assert.ok(fs.statSync(path.join(root,'approved','New Folder')).isDirectory());
  assert.throws(()=>createFolder(root,'approved/New Folder'),{code:'EEXIST'});
  for(const bad of ['','../outside','approved/../../outside','/tmp/out','approved//double','approved/./bad','C:/escape','approved\\escape','approved/bad\0name'])
   assert.throws(()=>createFolder(root,bad),bad);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('refuses symlink parent folders and files',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-folder-link-'));
 const outside=fs.mkdtempSync(path.join(os.tmpdir(),'air-folder-external-'));
 try{
  try{fs.symlinkSync(outside,path.join(root,'link'),'dir')}
  catch(error){if(process.platform==='win32'&&error.code==='EPERM')return;throw error}
  assert.throws(()=>createFolder(root,'link/evil'),/Invalid parent directory/);
  assert.equal(fs.existsSync(path.join(outside,'evil')),false);
 }finally{fs.rmSync(root,{recursive:true,force:true});fs.rmSync(outside,{recursive:true,force:true})}
});

test('duplicates files without replacing existing data',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-copy-'));
 try{
  fs.mkdirSync(path.join(root,'Docs'));
  fs.writeFileSync(path.join(root,'Docs','one.txt'),'original');
  assert.deepEqual(duplicateFile(root,'Docs/one.txt','Docs/two.txt'),{ok:true,path:'Docs/two.txt'});
  assert.equal(fs.readFileSync(path.join(root,'Docs','two.txt'),'utf8'),'original');
  assert.throws(()=>duplicateFile(root,'Docs/one.txt','Docs/two.txt'),{code:'EEXIST'});
  assert.equal(fs.readFileSync(path.join(root,'Docs','two.txt'),'utf8'),'original');
  for(const bad of ['../outside','Docs/../outside','/tmp/out','Docs\\wrong','Docs//bad'])assert.throws(()=>duplicateFile(root,'Docs/one.txt',bad));
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('rejects symlink sources for copy',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-copy-link-'));
 try{
  fs.writeFileSync(path.join(root,'valid.txt'),'valid');
  try{fs.symlinkSync(path.join(root,'valid.txt'),path.join(root,'link.txt'))}
  catch(error){if(process.platform==='win32'&&error.code==='EPERM')return;throw error}
  assert.throws(()=>duplicateFile(root,'link.txt','evil.txt'),/Symlinks/);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('file rename refuses replacement and preserves the original',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-rename-'));
 try{
  fs.mkdirSync(path.join(root,'Docs'));
  fs.writeFileSync(path.join(root,'Docs','old.txt'),'important');
  fs.writeFileSync(path.join(root,'Docs','taken.txt'),'keep');
  assert.throws(()=>renameFile(root,'Docs/old.txt','Docs/taken.txt'),{code:'EEXIST'});
  assert.equal(fs.readFileSync(path.join(root,'Docs','taken.txt'),'utf8'),'keep');
  assert.equal(fs.readFileSync(path.join(root,'Docs','old.txt'),'utf8'),'important');
  assert.deepEqual(renameFile(root,'Docs/old.txt','Docs/new.txt'),{ok:true,path:'Docs/new.txt'});
  assert.equal(fs.existsSync(path.join(root,'Docs','old.txt')),false);
  assert.equal(fs.readFileSync(path.join(root,'Docs','new.txt'),'utf8'),'important');
  assert.throws(()=>renameFile(root,'Docs/new.txt','../outside'));
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('creating a new text document never overwrites an existing file',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-newtext-'));
 try{
  const target=path.join(root,'important.txt');
  fs.writeFileSync(target,'KEEP USER DATA');
  assert.throws(()=>createEmptyTextExclusive(target),{code:'EEXIST'});
  assert.equal(fs.readFileSync(target,'utf8'),'KEEP USER DATA');
  const fresh=path.join(root,'new.txt');
  assert.deepEqual(createEmptyTextExclusive(fresh),{ok:true});
  assert.equal(fs.readFileSync(fresh,'utf8'),'');
  assert.throws(()=>createEmptyTextExclusive(fresh),{code:'EEXIST'});
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {merge,config,createCloud}=require('../src/main/cloud-notes.cjs');
const {createStore}=require('../src/main/notes-store.cjs');
const note=(title='A')=>({id:crypto.randomUUID(),title,body:'private',createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z'});
test('three-way merge: independent edits, deletes, edit/delete conflicts and limits',()=>{
 const a=note(),b=note('B');assert.deepEqual(merge([], [a], [b]),[a,b]);assert.deepEqual(merge([a],[],[a]),[]);
 assert.deepEqual(merge([a],[a],[]),[]);assert.throws(()=>merge([a],[{...a,title:'local'}],[]),/konflikt/);
 assert.throws(()=>merge([a],[{...a,title:'local'}],[{...a,title:'remote'}]),/konflikt/);
 assert.deepEqual(merge([a],[{...a,title:'new'}],[a]),[{...a,title:'new'}]);assert.throws(()=>merge([],Array.from({length:201},()=>note()),[]));
});
test('configuration rejects insecure hosts and service keys; disabled by default',()=>{
 assert.equal(config({}),null);assert.throws(()=>config({AIR_CLOUD_SUPABASE_URL:'http://localhost/',AIR_CLOUD_SUPABASE_ANON_KEY:'sb_publishable_x'}));
 assert.throws(()=>config({AIR_CLOUD_SUPABASE_URL:'https://test.supabase.co/',AIR_CLOUD_SUPABASE_ANON_KEY:'sb_secret_no'}));
 assert.equal(config({AIR_CLOUD_SUPABASE_URL:'https://test.supabase.co/',AIR_CLOUD_SUPABASE_ANON_KEY:'sb_publishable_x'}).url,'https://test.supabase.co');
});
function backend(){
 const rows=new Map([['alice',{revision:0,notes:[]}],['bob',{revision:0,notes:[]}]]);let offline=false,fail=false,beforeCommit=null;
 return {rows,set offline(v){offline=v;},set fail(v){fail=v;},set beforeCommit(v){beforeCommit=v;},fetch:async(url,opts)=>{
  if(offline)throw Error('offline');const body=opts.body?JSON.parse(opts.body):{},token=opts.headers.Authorization?.slice(7);let data;
  if(url.includes('/token')){const uid=body.email||body.refresh_token?.split(':')[0];if(!rows.has(uid))return {ok:false,status:401};data={user:{id:uid},access_token:uid,refresh_token:uid+':refresh'};}
  else if(url.includes('/logout'))data=null;
  else if(url.includes('/rpc/')){if(beforeCommit)await beforeCommit();if(fail)return {ok:false,status:500};const row=rows.get(token);if(row.revision!==body.expected_revision)data=null;else{row.notes=structuredClone(body.new_notes);data=++row.revision;}}
  else {const owner=new URL(url).searchParams.get('owner')?.slice(3);if(owner!==token)return {ok:false,status:403};data=[structuredClone(rows.get(token))];}
  return {ok:true,text:async()=>JSON.stringify(data)};
 }};
}
function instance(server){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-cloud-')),store=createStore({root:()=>root});
 const safeStorage={isEncryptionAvailable:()=>true,encryptString:s=>Buffer.from('encrypted:'+s),decryptString:b=>b.toString().slice(10)};
 const args={root:()=>root,store,safeStorage,settings:{url:'https://test.supabase.co',key:'sb_publishable_test'},fetchImpl:server.fetch};
 return {root,store,args,cloud:createCloud(args),close:()=>fs.rmSync(root,{recursive:true,force:true})};
}
const login=(i,email='alice',profile='local')=>i.cloud.signIn(profile,{email,password:'test-not-a-real-password'},()=>true);
test('two independent instances: create/edit/delete, offline/reconnect, restart and user isolation',async()=>{
 const server=backend(),a=instance(server),b=instance(server);try{
 await login(a);await login(b);await login(a,'bob','other');
 const n=a.store.save('local',{title:'One',body:'body'});await a.cloud.sync('local',()=>true);await b.cloud.sync('local',()=>true);assert.equal(b.store.list('local')[0].title,'One');assert.deepEqual(a.store.list('other'),[]);
 server.offline=true;b.store.save('local',{id:n.id,title:'Offline',body:'offline'});await assert.rejects(b.cloud.sync('local',()=>true),/erreichbar/);assert.equal(b.store.list('local')[0].title,'Offline');server.offline=false;
 b.cloud=createCloud(b.args);await b.cloud.sync('local',()=>true);await a.cloud.sync('local',()=>true);assert.equal(a.store.list('local')[0].title,'Offline');
 b.store.remove('local',n.id);await b.cloud.sync('local',()=>true);await a.cloud.sync('local',()=>true);assert.deepEqual(a.store.list('local'),[]);assert.deepEqual(server.rows.get('bob').notes,[]);
 await a.cloud.signOut('local');assert.equal(a.cloud.status('local').signedIn,false);await assert.rejects(a.cloud.sync('local',()=>true),/anmelden/);
 await assert.rejects(login(a,'bob'),/anderen Cloud/);
 }finally{a.close();b.close();}
});
test('conflicts and failed writes preserve both sides; stale editor cannot overwrite imported note',async()=>{
 const server=backend(),a=instance(server),b=instance(server);try{
 await login(a);await login(b);const n=a.store.save('local',{title:'original',body:'body'});await a.cloud.sync('local',()=>true);await b.cloud.sync('local',()=>true);
 a.store.save('local',{id:n.id,title:'A',body:'body'});b.store.save('local',{id:n.id,title:'B',body:'body'});await a.cloud.sync('local',()=>true);await assert.rejects(b.cloud.sync('local',()=>true),/konflikt/);assert.equal(b.store.list('local')[0].title,'B');assert.equal(server.rows.get('alice').notes[0].title,'A');
 assert.throws(()=>a.store.save('local',{id:n.id,title:'stale',body:'x',expectedSnapshot:n}),/inzwischen/);
 server.fail=true;a.store.save('local',{id:n.id,title:'C',body:'body'});await assert.rejects(a.cloud.sync('local',()=>true));assert.equal(server.rows.get('alice').notes[0].title,'A');assert.equal(a.store.list('local')[0].title,'C');
 }finally{a.close();b.close();}
});
test('logout/profile switch during request cannot apply private remote results; concurrent local edits retained',async()=>{
 const server=backend(),a=instance(server);try{
 await login(a);a.store.save('local',{title:'Local',body:'body'});let release,entered;
 const enteredPromise=new Promise(r=>entered=r);server.beforeCommit=async()=>{entered();await new Promise(r=>release=r);};
 const pending=a.cloud.sync('local',()=>true);await enteredPromise;a.cloud.suspend('local');release();await assert.rejects(pending,/Sitzungswechsel/);assert.equal(a.cloud.status('local').signedIn,false);assert.equal(a.store.list('local')[0].title,'Local');
 server.beforeCommit=null;await login(a);let release2,entered2;const p=new Promise(r=>entered2=r);server.beforeCommit=async()=>{entered2();await new Promise(r=>release2=r);};a.store.save('local',{title:'Second',body:'x'});
 const sync=a.cloud.sync('local',()=>true);await p;a.store.save('local',{title:'New while waiting',body:'x'});release2();await assert.rejects(sync,/Lokale Notizen/);assert.equal(a.store.list('local').length,3);
 }finally{a.close();}
});
test('secure storage unavailable blocks login without affecting local notes; unsafe remote payload rejected',async()=>{
 const a=instance(backend());try{a.args.safeStorage.isEncryptionAvailable=()=>false;await assert.rejects(login(a),/Schlüsselablage/);a.store.save('local',{title:'offline',body:'x'});assert.equal(a.store.list('local').length,1);assert.throws(()=>merge([],[],[{...note(),body:1}]));}finally{a.close();}
});
test('RLS owner isolation, CAS, no privileged renderer or shipped secret',()=>{
 const sql=fs.readFileSync(path.join(__dirname,'../docs/cloud/supabase.sql'),'utf8');assert.match(sql,/force row level security/);assert.match(sql,/owner = auth.uid\(\) and revision = expected_revision/);assert.match(sql,/revoke all on public.air_notes from anon, authenticated/);
 const preload=fs.readFileSync(path.join(__dirname,'../preload.cjs'),'utf8');assert.doesNotMatch(preload,/refresh_token|access_token|service_role/);
});
test('concurrent device CAS refuses a lost update and retries safely',async()=>{
 const server=backend(),a=instance(server),b=instance(server);try{
 await login(a);await login(b);a.store.save('local',{title:'Device A',body:'a'});b.store.save('local',{title:'Device B',body:'b'});
 let waiting=0,release;const gate=new Promise(r=>release=r);server.beforeCommit=async()=>{if(++waiting===2)release();await gate;};
 const results=await Promise.allSettled([a.cloud.sync('local',()=>true),b.cloud.sync('local',()=>true)]);assert.equal(results.filter(r=>r.status==='rejected').length,1);
 server.beforeCommit=null;await a.cloud.sync('local',()=>true);await b.cloud.sync('local',()=>true);await a.cloud.sync('local',()=>true);assert.equal(a.store.list('local').length,2);assert.equal(b.store.list('local').length,2);
 const old=a.store.list('local')[0];a.store.save('local',{id:old.id,title:'Changed',body:'x'});assert.throws(()=>a.store.remove('local',old.id,old),/Löschen abgebrochen/);assert.equal(a.store.list('local').length,2);
 }finally{a.close();b.close();}
});

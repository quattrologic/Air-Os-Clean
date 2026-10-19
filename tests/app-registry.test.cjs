'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const registry=require('../src/core/app-registry.js');
test('built-in apps remain registered',()=>{
  for(const id of ['finder','airwrite','music','aircard','calculator','settings','trash']) assert.ok(registry.get(id),id);
  assert.equal(registry.get('music').name,'Air Music');
  assert.equal(registry.get('airwrite').iconClass,'airwrite-icon');
});
test('lookups are safe and snapshots immutable',()=>{
  assert.equal(registry.get('__proto__'),null);
  assert.equal(registry.get('not-an-app'),null);
  const all=registry.list();
  assert.ok(all.length>=20);
  assert.ok(Object.isFrozen(all));
  assert.ok(Object.isFrozen(all[0]));
});
test('trusted extensions can register once',()=>{
  assert.deepEqual(registry.register('sample-demo',{name:'Sample Demo',iconClass:'demo-icon',glyph:'D'}),{id:'sample-demo',name:'Sample Demo',iconClass:'demo-icon',glyph:'D'});
  assert.equal(registry.get('sample-demo').name,'Sample Demo');
  assert.throws(()=>registry.register('sample-demo',{name:'Duplicate'}),/bereits registriert/);
});
test('unsafe identifiers and metadata are rejected',()=>{
  for(const id of ['__proto__','constructor','../escape','BAD','','a b']) assert.throws(()=>registry.register(id,{name:'Unsafe'}));
  assert.throws(()=>registry.register('empty-name',{name:'  '}));
  assert.throws(()=>registry.register('bad-class',{name:'App',iconClass:'x\" onload=\"evil'}));
  assert.throws(()=>registry.register('bad-glyph',{name:'App',glyph:'0123456789'}));
});

test('installed signed app metadata appears in registry and is removable',()=>{
 const events=[],stop=registry.onChange(()=>events.push(1));
 registry.syncInstalled([{id:'com.airos.demo.timer',name:'Air Timer',version:'1.0.0'}]);
 assert.equal(registry.get('com.airos.demo.timer').origin,'store');
 assert.ok(registry.list().some(a=>a.id==='com.airos.demo.timer'));
 registry.syncInstalled([]);
 assert.equal(registry.get('com.airos.demo.timer'),null);
 assert.ok(events.length>=2);stop();
});
test('installed metadata cannot masquerade as a built-in app',()=>{
 assert.throws(()=>registry.syncInstalled([{id:'finder',name:'Spoof'}]));
 assert.throws(()=>registry.syncInstalled([{id:'com.airos.demo.timer',name:''}]));
});

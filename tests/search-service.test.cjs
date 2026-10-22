'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const search=require('../src/core/search-service.js');
const registry=require('../src/core/app-registry.js');
test('search matches application names and IDs without executing apps',()=>{
 assert.ok(search.findApps(registry,'music').some(app=>app.id==='music'));
 assert.ok(search.findApps(registry,'calculator').some(app=>app.id==='calculator'));
 assert.deepEqual(search.findApps(registry,'__unknown__'),[]);
 assert.ok(search.findApps(registry,'').length>=15);
});
test('search results are bounded and immutable',()=>{
 const result=search.findApps(registry,'',3);
 assert.ok(result.length<=3);assert.ok(Object.isFrozen(result));assert.ok(Object.isFrozen(result[0]));
 assert.throws(()=>search.findApps(registry,'',0));
});

test('note search matches only provided authenticated note titles',()=>{
 const notes=[{id:'1',title:'Urlaub planen',body:'Secret'},{id:'2',title:'Projekt Air OS',body:'Secret'},{id:'3',title:'Shopping',body:'Urlaub'}];
 assert.deepEqual(search.findNotes(notes,'urlaub').map(n=>n.id),['1']);
 assert.deepEqual(search.findNotes(notes,'u'),[]);
 assert.deepEqual(search.findNotes(notes,'secret'),[]);
 const result=search.findNotes(notes,'projekt');
 assert.equal(result[0].title,'Projekt Air OS');
 assert.ok(Object.isFrozen(result));assert.ok(Object.isFrozen(result[0]));
 assert.throws(()=>search.findNotes(notes,'test',0));
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),lifecycle=require('../src/core/app-lifecycle.js');
test('opening, minimizing, focusing and closing are observable',()=>{
 const events=[],off=lifecycle.onChange(event=>events.push(event));
 assert.equal(lifecycle.get('finder'),'closed');
 assert.equal(lifecycle.transition('finder','focused'),true);
 assert.equal(lifecycle.transition('finder','focused'),false);
 assert.equal(lifecycle.transition('finder','minimized'),true);
 assert.equal(lifecycle.transition('finder','focused'),true);
 assert.equal(lifecycle.transition('finder','closed'),true);
 assert.equal(lifecycle.get('finder'),'closed');
 assert.deepEqual(events.map(event=>event.state),['focused','minimized','focused','closed']);
 assert.ok(Object.isFrozen(events[0]));
 off();
});
test('invalid states and identifiers fail',()=>{
 assert.throws(()=>lifecycle.transition('__proto__','running'),/Invalid app ID/);
 assert.throws(()=>lifecycle.transition('finder','deleted'),/Unknown lifecycle/);
 assert.throws(()=>lifecycle.onChange(null),/Listener/);
});

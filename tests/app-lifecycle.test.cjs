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
test('focusing A then B then A notifies observers even when A last reported focused',()=>{
 const events=[],off=lifecycle.onChange(event=>events.push(event));
 try{
  lifecycle.transition('notes','focused');
  lifecycle.transition('calculator','focused');
  assert.equal(lifecycle.transition('notes','focused'),true,'Reacquiring focus must notify the Dock');
  assert.equal(lifecycle.transition('notes','focused'),false,'Repeated focus on the active app stays idempotent');
  assert.deepEqual(events.filter(e=>e.state==='focused').map(e=>e.id),['notes','calculator','notes']);
 }finally{off();lifecycle.transition('notes','closed');lifecycle.transition('calculator','closed');}
});
test('minimize, restore and background closure preserve focus notifications without reviving hidden apps',()=>{
 const focused=[],off=lifecycle.onChange(event=>{if(['focused','maximized'].includes(event.state))focused.push(event.id);});
 try{
  lifecycle.transition('notes','maximized');
  lifecycle.transition('calculator','focused');
  lifecycle.transition('calculator','minimized');
  assert.equal(lifecycle.transition('notes','maximized'),true,'An already maximized window can regain focus');
  lifecycle.transition('calculator','closed');
  assert.equal(lifecycle.transition('notes','maximized'),false,'Closing a background app must not forget current focus');
  lifecycle.transition('notes','minimized');
  assert.equal(lifecycle.get('notes'),'minimized');
  lifecycle.transition('calculator','focused');
  assert.equal(lifecycle.get('notes'),'minimized','Focusing another app never restores a minimized window');
  lifecycle.transition('notes','focused');
  assert.deepEqual(focused,['notes','calculator','notes','calculator','notes']);
 }finally{off();lifecycle.transition('notes','closed');lifecycle.transition('calculator','closed');}
});

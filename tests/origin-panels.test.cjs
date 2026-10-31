'use strict';
const test=require('node:test'),a=require('node:assert/strict'),m=require('../src/core/panel-navigation.js');
test('Control keyboard direction follows real tile geometry rather than source order',()=>{
 const tiles=[{id:'large',x:200,y:40},{id:'a',x:50,y:40},{id:'b',x:50,y:120},{id:'c',x:200,y:120}];
 a.equal(m.direction(tiles,'a','ArrowRight'),'large');a.equal(m.direction(tiles,'a','ArrowDown'),'b');a.equal(m.direction(tiles,'c','ArrowLeft'),'b');a.equal(m.direction(tiles,'a','ArrowLeft'),null);a.equal(m.direction(tiles,'c','Home'),'large');a.equal(m.direction([],null,'End'),null);
});
test('Notification stacking caps visible banners by actual height and available viewport',()=>{
 a.deepEqual(m.bannerStack([80,80,80,80,80],1080),[52,140,228,316]);a.deepEqual(m.bannerStack([130,130,130,130],390),[52,190]);a.deepEqual(m.bannerStack([],600),[]);const large=m.bannerStack([2000,100],600);a.deepEqual(large,[52]);
});

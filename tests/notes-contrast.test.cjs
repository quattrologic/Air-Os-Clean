'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const css=fs.readFileSync(require.resolve('../styles.css'),'utf8');
function rule(selector){const start=css.indexOf(selector+'{');assert.ok(start>=0,selector);return css.slice(start+selector.length+1,css.indexOf('}',start))}
function value(selector,property){const match=rule(selector).match(new RegExp('(?:^|;)'+property+':([^;]+)'));assert.ok(match,property);return match[1]}
const scope='html[data-desktop-theme="modern"] .air-notes-window';
function luminance(hex){const a=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);return a.reduce((sum,v,i)=>sum+(v<=.04045?v/12.92:((v+.055)/1.055)**2.4)*[.2126,.7152,.0722][i],0)}
function contrast(a,b){const x=[luminance(a),luminance(b)].sort((a,b)=>a-b);return(x[1]+.05)/(x[0]+.05)}
test('Modern Notes status and normal-text placeholder meet 4.5:1 on their actual declared surfaces',()=>{
 const editor=value(scope+' .note-workspace','background'),actions=value(scope+' .note-actions','background');
 const status=value(scope+' #note-status','color');
 const placeholder=value(scope+' input::placeholder,'+scope+' textarea::placeholder','color');
 assert.ok(contrast(status,actions)>=4.5);assert.ok(contrast(placeholder,editor)>=4.5);
 assert.equal(value(scope+' input::placeholder,'+scope+' textarea::placeholder','opacity'),'1');
 assert.ok(contrast('#677e6c',editor)<4.5,'old color must remain a meaningful negative regression case');
 assert.ok(Math.abs(contrast(status,actions)-4.6992)<.00001);
});

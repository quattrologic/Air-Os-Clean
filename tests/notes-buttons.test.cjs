'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const css=fs.readFileSync(require.resolve('../styles.css'),'utf8');
const scope='html[data-desktop-theme="modern"] .air-notes-window ';
const rule=selector=>{const start=css.indexOf(selector+'{');assert.notEqual(start,-1,selector);return Object.fromEntries(css.slice(start+selector.length+1,css.indexOf('}',start)).split(';').filter(Boolean).map(s=>{const at=s.indexOf(':');return[s.slice(0,at).trim(),s.slice(at+1).trim()]}))};
test('CB-02 real Notes buttons meet 24px, with centered 10px dots and room for unclipped focus inside existing titlebar',()=>{
 const b=rule(scope+'.traffic button'),dot=rule(scope+'.traffic button::before'),bar=rule(scope+'.window-titlebar'),focus=rule(scope+'.traffic button:focus-visible');
 for(const key of ['width','height','min-width','min-height'])assert.ok(parseFloat(b[key])>=24,key);
 assert.equal(b.background,'transparent');assert.equal(b['border-radius'],'0','full rectangular hit area includes corners');assert.equal(b['box-shadow'],'none');assert.equal(b.padding,'0');assert.equal(b.position,'relative');assert.equal(dot.width,'10px');assert.equal(dot.height,'10px');assert.equal(dot.left,'50%');assert.equal(dot.top,'50%');assert.equal(dot.transform,'translate(-50%,-50%)');assert.equal(dot['pointer-events'],'none');assert.equal(dot.position,'absolute');
 assert.ok(parseFloat(rule(scope+'.traffic').gap)>0);assert.ok(parseFloat(b.height)+2*(parseFloat(focus.outline)+parseFloat(focus['outline-offset']))<=parseFloat(bar.height));
});
test('CB-02 retains original dot colors, accessible focus and original shared/Classic and Home button rules',()=>{
 for(const type of ['close','minimize','maximize'])assert.equal(rule(scope+'.traffic .'+type)['--notes-traffic-color'],rule('.'+type).background);
 assert.equal(rule('.traffic button').width,'13px');assert.equal(rule('.traffic button').height,'13px');assert.equal(rule('.air-home-window .traffic button').width,'9px');assert.equal(rule('.air-home-window .traffic button').height,'9px');
 assert.ok(parseFloat(rule(scope+'.traffic button:focus-visible').outline)>=2);assert.ok(rule(scope+'.traffic button:hover').background);
});

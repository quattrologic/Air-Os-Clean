'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const media=require('../maclock-media.js');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function fixture(){
 const win=new EventTarget(),doc=new EventTarget(),forced=new EventTarget();forced.matches=false;let ready,disconnects=0,draws=0;const nodes={},canvases=['prev','play','next'].map(kind=>({dataset:{glyph:kind},getContext:()=>({scale(){},beginPath(){},moveTo(){},arcTo(){},closePath(){},fill(){draws++}})}));
 for(const id of ['maclock-media','maclock-media-demo','maclock-media-title','maclock-media-artist','maclock-media-elapsed','maclock-media-remaining']){nodes[id]={style:{},hidden:false,textContent:'',querySelectorAll:()=>canvases};Object.defineProperty(nodes[id],'innerHTML',{set(){throw Error('HTML injection forbidden')}})}
 const clock={getBoundingClientRect:()=>({height:200})};doc.querySelector=s=>{assert.ok(s==='.maclock-clock'||nodes[s.slice(1)],'only public media/clock nodes may be read');return s==='.maclock-clock'?clock:nodes[s.slice(1)]};doc.fonts={ready:new Promise(r=>ready=r)};
 Object.assign(win,{document:doc,innerHeight:1080,innerWidth:1920,devicePixelRatio:1,AbortController,Event,matchMedia:()=>forced,getComputedStyle:()=>({color:forced.matches?'rgb(0, 0, 0)':'rgb(255, 255, 255)'}),ResizeObserver:class{observe(e){assert.equal(e,clock)}disconnect(){disconnects++}}});
 for(const key of ['airOS','localStorage','fetch','Audio','requestAnimationFrame','setInterval','setTimeout'])Object.defineProperty(win,key,{get(){throw Error('No private bridge/audio/polling access: '+key)}});
 const controller=media.mount(win);return{win,doc,nodes,canvases,forced,controller,ready:async()=>{ready();await Promise.resolve()},disconnects:()=>disconnects,draws:()=>draws};
}
test('compact card uses original top slot and 372u/150u/28u/58u geometry at all requested sizes',()=>{
 for(const [w,h,u]of [[1920,1080,.9],[1650,930,.775],[390,600,.6]]){
  const m=media.layout(h,200,w);assert.equal(m.u,u);assert.equal(m.width,372*u);assert.equal(m.height,150*u);assert.equal(m.radius,28*u);assert.equal(m.cover,58*u);assert.equal(m.y,.075*h+200+22*u);assert.equal(m.x+m.width/2,w/2);assert.ok(m.x>=0&&m.x+m.width<=w);
 }
});
test('only frozen public demo metadata is rendered; private bridges, audio, timers and HTML are never touched',()=>{
 const h=fixture();assert.equal(Object.isFrozen(media.demo),true);assert.match(h.nodes['maclock-media-demo'].textContent,/DEMO · keine Audiowiedergabe/);assert.equal(h.nodes['maclock-media-title'].textContent,'Wolkenlicht');assert.equal(h.nodes['maclock-media-artist'].textContent,'Air-OS Studio');assert.equal(h.nodes['maclock-media-elapsed'].textContent,'0:56');assert.equal(h.nodes['maclock-media-remaining'].textContent,'-2:24');assert.equal(h.draws(),5);h.controller.destroy();
});
test('original scrub formatter handles zero, floor, negative and invalid demo boundaries',()=>{
 for(const [input,expected]of [[0,'0:00'],[56.9,'0:56'],[200,'3:20'],[-8,'0:00'],[NaN,'0:00'],[Infinity,'0:00']])assert.equal(media.fmt(input),expected);
});
test('static glyphs retain MIT original rounded-polygon coordinates and byte-exact audit source',()=>{
 const bytes=fs.readFileSync(path.join(root,'third_party/maclock/original/Glyph.qml')),manifest=JSON.parse(read('third_party/maclock/SOURCE_MANIFEST.json'));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),manifest.files.find(x=>x.path==='MacLock/Glyph.qml').sha256);assert.match(read('third_party/maclock/LICENSE'),/Copyright \(c\) 2026 Rickky/);
 const trace=[],ctx={beginPath(){},moveTo(){},arcTo(...args){trace.push(args)},closePath(){},fill(){}};media.glyph(ctx,'play');assert.deepEqual(trace,[[5,3.2,10,6.1,.8],[15,9,10,11.9,.8],[5,14.8,5,9,.8]]);
});
test('resize redraws public glyphs only when geometry changes, not on every frame',async()=>{
 const h=fixture();const first=h.controller.snapshot();await h.ready();h.win.dispatchEvent(new Event('resize'));assert.equal(h.controller.snapshot().updates,first.updates);h.win.innerHeight=600;h.win.innerWidth=390;h.win.dispatchEvent(new Event('resize'));assert.equal(h.controller.snapshot().updates,first.updates+1);assert.equal(h.controller.snapshot().layout.width,223.2);assert.equal(h.draws(),10);h.controller.destroy();
});
test('pagehide cleans listeners/observer/canvases; late font readiness cannot resurrect a closed page',async()=>{
 const h=fixture();h.win.dispatchEvent(new Event('pagehide'));h.win.dispatchEvent(new Event('resize'));await h.ready();h.controller.destroy();assert.equal(h.controller.snapshot().disposed,true);assert.equal(h.controller.snapshot().updates,1);assert.equal(h.nodes['maclock-media'].hidden,true);assert.equal(h.disconnects(),1);assert.ok(h.canvases.every(c=>c.width===0&&c.height===0));
});
test('native demo controls cannot seek, play, navigate or submit the authentication form',()=>{
 const markup=read('login.html').split('<section id="maclock-media"')[1].split('</section>')[0];assert.equal((markup.match(/<button type="button"[^>]* disabled/g)||[]).length,3);assert.match(markup,/role="progressbar"/);assert.doesNotMatch(markup,/<(?:audio|video|input|form)\b|onclick|tabindex|href=/);assert.doesNotMatch(read('maclock-media.js'),/innerHTML|\.airOS|localStorage|new Audio|setInterval|requestAnimationFrame|fetch\(/);
});
test('media-only CSS retains forced-colors/reduced-glass fallback and never changes shared desktop/window selectors',()=>{
 const css=read('maclock-media.css');assert.match(css,/forced-colors:active/);assert.match(css,/prefers-reduced-transparency:reduce/);assert.match(css,/data-maclock-glass="reduced"/);assert.match(css,/maclock-motion-pending/);assert.doesNotMatch(css,/(?:^|\})\s*(?:\.dock|\.window|html|body|\.air-island|\.login-stage)\s*[{:]/);
 const build=JSON.parse(read('package.json')).build.files;for(const p of ['maclock-media.js','maclock-media.css','maclock-demo-cover.svg'])assert.ok(build.includes(p),'new runtime file packaged: '+p);
});

test('forced-colors palette changes redraw only public glyphs and the listener is removed on pagehide',()=>{
 const h=fixture();h.forced.matches=true;h.forced.dispatchEvent(new Event('change'));assert.equal(h.draws(),10);assert.equal(h.controller.snapshot().updates,2);h.win.dispatchEvent(new Event('pagehide'));h.forced.matches=false;h.forced.dispatchEvent(new Event('change'));assert.equal(h.draws(),10);
});

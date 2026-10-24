'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const api=require('../maclock-glass.js'),shaders=require('../maclock-shaders.js');
const tick=()=>new Promise(r=>setImmediate(r));
function fakeGL(options={}){
 const live=new Set(),deleted=[],gl={lost:false,compiles:0,losses:0,frameError:false};let next=0;
 const constants=['VERTEX_SHADER','FRAGMENT_SHADER','COMPILE_STATUS','LINK_STATUS','ACTIVE_UNIFORMS','ARRAY_BUFFER','STATIC_DRAW','FLOAT','FRAMEBUFFER','FRAMEBUFFER_COMPLETE','COLOR_ATTACHMENT0','TEXTURE_2D','TEXTURE0','TEXTURE_MIN_FILTER','TEXTURE_MAG_FILTER','LINEAR','LINEAR_MIPMAP_LINEAR','TEXTURE_WRAP_S','TEXTURE_WRAP_T','CLAMP_TO_EDGE','RGBA','UNSIGNED_BYTE','UNPACK_FLIP_Y_WEBGL','UNPACK_PREMULTIPLY_ALPHA_WEBGL','MAX_TEXTURE_SIZE','TRIANGLE_STRIP','BLEND','ONE','ONE_MINUS_SRC_ALPHA','COLOR_BUFFER_BIT','SAMPLER_2D','BOOL','INT'];for(const [i,k]of constants.entries())gl[k]=i+1;gl.NO_ERROR=0;
 for(const kind of ['Shader','Program','Texture','Buffer','Framebuffer','VertexArray']){
  gl['create'+kind]=()=>{const v={kind,id:++next};live.add(v);return v};
  gl['delete'+kind]=v=>{assert.ok(live.delete(v),'resource deleted exactly once');deleted.push(v)};
 }
 for(const name of ['shaderSource','attachShader','linkProgram','useProgram','uniform1i','uniform1f','uniform2fv','uniform4fv','bindTexture','texParameteri','pixelStorei','activeTexture','disable','enable','bindFramebuffer','viewport','framebufferTexture2D','drawArrays','generateMipmap','bindVertexArray','bindBuffer','bufferData','enableVertexAttribArray','vertexAttribPointer','clearColor','clear','blendFunc'])gl[name]=()=>{};
 gl.compileShader=()=>gl.compiles++;gl.getShaderParameter=()=>gl.compiles!==options.failCompileAt;gl.getShaderInfoLog=()=> 'injected compile failure';
 gl.getProgramParameter=(p,key)=>key===gl.ACTIVE_UNIFORMS?0:true;gl.getParameter=()=>4096;gl.getError=()=>gl.frameError?1:0;
 gl.texImage2D=()=>{if(options.uploadFailure)throw Error('injected upload failure')};gl.checkFramebufferStatus=()=>options.framebufferFailure?0:gl.FRAMEBUFFER_COMPLETE;
 gl.isContextLost=()=>gl.lost;gl.getExtension=()=>({loseContext:()=>{gl.losses++;gl.lost=true}});
 return{gl,live,deleted};
}
function fixture(options={}){
 const g=fakeGL(options),rafs=new Map(),created=[],observers=[],media=[];let raf=0;
 class Element extends EventTarget{
  constructor(){super();this.classes=new Set();this.classList={contains:k=>this.classes.has(k),add:k=>this.classes.add(k),remove:k=>this.classes.delete(k),toggle:(k,v)=>v?this.classes.add(k):this.classes.delete(k)};this.dataset={};this.children=[];this.attrs={};this.textContent='10:24';this.width=1;this.height=1;}
  setAttribute(k,v){this.attrs[k]=v}removeAttribute(k){delete this.attrs[k]}appendChild(e){this.children.push(e)}remove(){this.removed=true}
  getBoundingClientRect(){return{x:850,y:950,width:189,height:32}}
  getContext(type){if(type==='webgl2')return options.noGL?null:g.gl;return{letterSpacing:'0',scale(){},drawImage(){},createLinearGradient(){return{addColorStop(){}}},fillRect(){},fillText(){},measureText(){return{fontBoundingBoxAscent:150,width:400}}}}
 }
 const doc=new EventTarget();doc.body=new Element();doc.documentElement=new Element();doc.hidden=false;doc.fonts={ready:Promise.resolve()};
 const nodes=Object.fromEntries(['#login-clock','.password-row','#maclock-reduce-glass','#login-stage'].map(k=>[k,new Element()]));
 doc.querySelector=s=>{assert.ok(nodes[s],'no secret/profile access');return nodes[s]};doc.createElement=()=>{const e=new Element();created.push(e);return e};doc.createRange=()=>({selectNodeContents(){},getBoundingClientRect:()=>({x:750,y:95,width:420,height:190})});
 const win=new EventTarget();Object.assign(win,{document:doc,innerWidth:1920,innerHeight:1080,devicePixelRatio:1,airMacLockShaders:shaders,AbortController,CustomEvent,Event,requestAnimationFrame:fn=>{rafs.set(++raf,fn);return raf},cancelAnimationFrame:id=>rafs.delete(id),getComputedStyle:()=>({fontWeight:'680',fontSize:'158.4px',fontFamily:'Open Runde',letterSpacing:'-1.35px'}),matchMedia:()=>{const m=new EventTarget();m.matches=false;media.push(m);return m}});
 Object.defineProperty(win,'airOS',{get(){throw Error('No authentication/Preferences/secret API may be read by materials')}});
 let resolve;win.Image=class{constructor(){this.naturalWidth=1920;this.naturalHeight=1080}decode(){return new Promise(r=>resolve=r)}removeAttribute(){}};
 win.MutationObserver=class{constructor(cb){this.cb=cb;observers.push(this)}observe(){}disconnect(){this.disconnected=true}};win.ResizeObserver=class extends win.MutationObserver{};
 const c=api.mount(win);return{...g,win,doc,nodes,c,rafs,created,media,observers,ready:async()=>{resolve();await tick()},flush:()=>{const pending=[...rafs.values()];rafs.clear();pending.forEach(fn=>fn())}};
}
test('WebGL2 fragment ports preserve original main/math exactly, with only ES declarations and clock uniform rename',()=>{
 for(const [name,key]of [['liquidglass','liquidglass'],['glasstext','glasstext']]){
  const original=fs.readFileSync(require.resolve('../third_party/maclock/original/'+name+'.frag'),'utf8');
  const start=original.indexOf(name==='liquidglass'?'const int   TAPS':'float H(');
  const body=original.slice(start).replace(name==='glasstext'?/\brefract\b/g:/$^/g,'refractPx');assert.equal(shaders[key].slice(shaders[key].indexOf(name==='liquidglass'?'const int   TAPS':'float H(')),body);
  assert.match(shaders[key],/^#version 300 es/);assert.doesNotMatch(shaders[key],/layout\(binding|std140|qt_Matrix/);
 }
 const manifest=require('../third_party/maclock/SOURCE_MANIFEST.json');for(const name of ['liquidglass','glasstext']){
  const b=fs.readFileSync(require.resolve('../third_party/maclock/original/'+name+'.frag'));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),manifest.files.find(f=>f.path==='MacLock/'+name+'.frag').sha256);
 }
});
test('original Glass.qml and Clock uniforms, including half-size preblur and height-map controls, are retained',()=>{
 for(const height of [1080,930,600]){const h=36*Math.max(.6,height/1200),p=api.parameters(height,h),u=Math.max(.6,height/1200);
  assert.equal(p.clock.intensity,.6);assert.equal(p.clock.bevel,4.5);assert.equal(p.clock.refractPx,7.6*u);assert.equal(p.clock.heightRadius,16*Math.max(.12,Math.min(.6,(176*u)*.04/16)));assert.deepEqual(p.clock.lightDir,[-.6,-.8]);
  assert.equal(p.scene.scale,.5);assert.equal(p.scene.blurMax,32);assert.equal(p.scene.blur,.35);assert.equal(p.field.thickness,28.8);assert.equal(p.field.tintMix,.275);assert.equal(p.field.shadowAmt,.4);assert.equal(p.field.bezel,Math.min(h*.36,26));assert.equal(p.field.pad,10);assert.equal(p.field.dispersion,.078);assert.ok(Math.abs(p.field.magnify-.08)<1e-12);
 }
});
test('renderer replaces textures without accumulation and destroys every GPU object once, idempotently',()=>{
 const g=fakeGL(),canvas={getContext:()=>g.gl,width:1,height:1},r=api.createRenderer(canvas,shaders),params=api.parameters(1080,32);
 for(let i=0;i<8;i++){r.setScene({width:960,height:540},11.2);r.setMask({width:600,height:350},6.3);r.draw({width:1920,height:1080,clockRect:{x:600,y:10,width:600,height:350},fieldRect:{x:850,y:950,width:189,height:32},params});assert.equal(r.snapshot().resources.texture,3)}
 r.destroy();r.destroy();assert.equal(g.live.size,0);assert.equal(g.gl.losses,1);assert.equal(r.snapshot().contextAlive,false);
});
test('motion uses one cached scene texture and validates initial/final frames without accumulating GPU resources',()=>{
 const g=fakeGL(),r=api.createRenderer({getContext:()=>g.gl},shaders),params=api.parameters(1080,32),frame={width:1920,height:1080,clockRect:{x:600,y:10,width:600,height:350},fieldRect:{x:850,y:950,width:189,height:32},params};
 let checks=0;const error=g.gl.getError;g.gl.getError=()=>{checks++;return error()};r.setScene({width:960,height:540},11.2);r.setMask({width:600,height:350},6.3);
 const initial=checks;for(let i=0;i<12;i++){r.draw({...frame,validate:i===0,sceneState:{zoom:1.09-i*.005,blur:.55,blurOpacity:1,opacity:.8,clockOpacity:.8,loginOpacity:.8}});assert.equal(r.snapshot().resources.texture,4)}assert.equal(checks,initial+1);
 r.draw({...frame,sceneState:{zoom:1,blur:0,blurOpacity:0,opacity:1,clockOpacity:1,loginOpacity:1}});assert.equal(checks,initial+2);assert.equal(r.snapshot().resources.texture,3);assert.equal(r.snapshot().resources.program,4);r.destroy();assert.equal(g.live.size,0);
});
test('compile/allocation-pass failures release partial GPU objects rather than hiding working DOM controls',()=>{
 const g=fakeGL({failCompileAt:3});assert.throws(()=>api.createRenderer({getContext:()=>g.gl},shaders),/compile/);assert.equal(g.live.size,0);
 for(const flag of ['framebufferFailure','uploadFailure']){const g=fakeGL({[flag]:true}),r=api.createRenderer({getContext:()=>g.gl},shaders);assert.throws(()=>r.setScene({width:64,height:64},11.2));r.destroy();assert.equal(g.live.size,0)}
});
test('unavailable WebGL keeps CSS fallback and the untouched authenticated input path',async()=>{
 const h=fixture({noGL:true});await h.ready();h.flush();assert.equal(h.c.snapshot().status,'fallback');assert.equal(h.doc.body.classList.contains('has-maclock-glass'),false);assert.equal(h.live.size,0);h.c.destroy();
});
test('materials activate only after a valid frame; forced/reduced glass releases GPU objects and queued work',async()=>{
 for(const index of [0,1,2]){const h=fixture();await h.ready();h.flush();assert.equal(h.c.snapshot().status,'webgl');assert.equal(h.doc.body.classList.contains('has-maclock-glass'),true);h.media[index].matches=true;h.media[index].dispatchEvent(new Event('change'));h.flush();assert.equal(h.c.snapshot().status,'reduced');assert.equal(h.live.size,0);assert.equal(h.doc.body.classList.contains('has-maclock-glass'),false);assert.equal(h.rafs.size,0);h.c.destroy();}
});
test('pagehide releases resources, listeners and frames; late image/font completion cannot revive a previous page',async()=>{
 const h=fixture();await h.ready();h.flush();h.win.dispatchEvent(new Event('resize'));assert.equal(h.rafs.size,1);h.win.dispatchEvent(new Event('pagehide'));assert.equal(h.live.size,0);assert.equal(h.rafs.size,0);assert.equal(h.c.snapshot().disposed,true);assert.ok(h.observers.every(o=>o.disconnected));
 const late=fixture();late.c.destroy();await late.ready();late.flush();assert.equal(late.live.size,0);assert.equal(late.c.snapshot().status,'disposed');
});
test('old context-loss handlers cannot affect a replacement surface; current loss restores CSS fallback immediately',async()=>{
 const h=fixture();await h.ready();h.flush();const old=h.doc.body.children.at(-1);h.nodes['#maclock-reduce-glass'].dispatchEvent(new Event('click'));h.flush();assert.equal(h.live.size,0);h.gl.lost=false;h.nodes['#maclock-reduce-glass'].dispatchEvent(new Event('click'));h.flush();assert.equal(h.c.snapshot().status,'webgl');old.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));assert.equal(h.c.snapshot().status,'webgl');h.doc.body.children.at(-1).dispatchEvent(new Event('webglcontextlost',{cancelable:true}));assert.equal(h.c.snapshot().status,'fallback');assert.equal(h.live.size,0);assert.equal(h.doc.body.classList.contains('has-maclock-glass'),false);h.c.destroy();
});
test('hidden pages release materials and become static; visible pages can recreate public textures without polling',async()=>{
 const h=fixture();await h.ready();h.flush();h.doc.hidden=true;h.doc.dispatchEvent(new Event('visibilitychange'));h.flush();assert.equal(h.live.size,0);assert.equal(h.c.snapshot().status,'hidden');h.gl.lost=false;h.doc.hidden=false;h.doc.dispatchEvent(new Event('visibilitychange'));h.flush();assert.equal(h.c.snapshot().status,'webgl');assert.equal(h.rafs.size,0);h.c.destroy();
});
test('enhancement CSS only affects MacLock materials, is non-blocking and includes no new animation/layout transforms',()=>{
 const css=fs.readFileSync(require.resolve('../login.css'),'utf8').split('/* L1B.1:')[1].split('/* L1B.2:')[0];assert.match(css,/pointer-events:none/);assert.doesNotMatch(css,/transform:|animation:|transition:|\.dock|\.air-island|\.air-home|\.air-notes/);
 const pkg=require('../package.json');for(const path of ['maclock-shaders.js','maclock-glass.js','third_party/maclock/**/*'])assert.ok(pkg.build.files.includes(path));
});

test('public material tiles are cached between draws and released on context loss, without extra WebGL programs',async()=>{
 const h=fixture();h.win.airMacLockMorphController={};h.win.airMacLockMotionController={snapshot:()=>({active:false,values:{opacity:1,clockOpacity:1,loginOpacity:1,zoom:1,blur:0,blurOpacity:0}})};await h.ready();h.flush();assert.equal(h.c.snapshot().tileBuilds,1);const tile=h.c.clockTile();assert.equal(tile.text,'10:24');assert.ok(tile.canvas);assert.ok(tile.field.canvas);h.win.dispatchEvent(new Event('resize'));h.flush();assert.equal(h.c.clockTile(),tile);assert.equal(h.c.snapshot().tileBuilds,1);assert.equal(h.c.snapshot().renderer.resources.program,4);h.doc.body.children.at(-1).dispatchEvent(new Event('webglcontextlost',{cancelable:true}));assert.equal(h.c.clockTile(),null);h.c.destroy();assert.equal(h.live.size,0);
});
test('software renderer detection avoids all material readback tiles while retaining real GL and finite content notifications',async()=>{
 const h=fixture(),extension=h.gl.getExtension;h.gl.getExtension=name=>name==='WEBGL_debug_renderer_info'?{UNMASKED_RENDERER_WEBGL:999}:extension(name);h.gl.getParameter=p=>p===999?'ANGLE SwiftShader':4096;h.win.airMacLockMorphController={};h.win.airMacLockMotionController={snapshot:()=>({active:false,values:{opacity:1,clockOpacity:1,loginOpacity:1,zoom:1,blur:0,blurOpacity:0}})};await h.ready();h.flush();assert.equal(h.c.snapshot().status,'webgl');assert.equal(h.c.snapshot().software,true);assert.deepEqual(h.c.clockTile(),{text:'10:24',software:true});assert.equal(h.c.snapshot().renderer.resources.program,4);const frames=h.c.snapshot().frames;h.flush();assert.equal(h.c.snapshot().frames,frames);h.c.destroy();assert.equal(h.c.clockTile(),null);assert.equal(h.live.size,0);
});

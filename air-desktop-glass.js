'use strict';
// Shared MacShell WebGL2 materials; only wallpaper pixels enter GPU memory.
(() => {
 const selectors='.dock[data-theme="modern"],#air-island-toggle,#air-island-panel,.air-calendar-panel,.air-search-dialog,.app-window>.window-titlebar,.deep-widget,.deep-history,.deep-dock-menu,.deep-toast';
 const events=new AbortController(),signal=events.signal,tiles=new Map(),media=[matchMedia('(prefers-reduced-transparency: reduce)'),matchMedia('(prefers-contrast: more)'),matchMedia('(forced-colors: active)')];
 const canvas=document.createElement('canvas');let gl=null,programs={},buffer=null,texture=null,scene=null,epoch=0,disposed=false,failed=false,reason='',painting=false,dirty=false,frame=null,settle=null,lastPaint=0,fallbackAt=0,software=false,diagnostic=false,diagnosticRefraction=true;
 let draws=0,sceneBuilds=0,transfers=0,paintMs=0;const programsLive=new Set(),shadersLive=new Set();
 const vertex='#version 300 es\nlayout(location=0) in vec2 p;out vec2 qt_TexCoord0;void main(){gl_Position=vec4(p,0.,1.);qt_TexCoord0=vec2((p.x+1.)*.5,1.-(p.y+1.)*.5);}';
 const policy=Promise.resolve(window.airOS?.glass?.testPolicy?.()).then(p=>{diagnostic=p?.isolatedDiagnostic===true;}).catch(()=>{});
 function reduced(){return readAirSettings().reduceGlass||media.some(m=>m.matches);}
 function motionReduced(){return readAirSettings().reduceMotion||matchMedia('(prefers-reduced-motion: reduce)').matches;}
 function removeTile(el,t){t.canvas.remove();el.classList.remove('deep-glass-host','glass2-active','glass2-tinted');for(const c of t.contents)c.classList.remove('glass2-content','glass2-static-content');}
 function release(){epoch++;clearTimeout(settle);settle=null;for(const [el,t]of tiles)removeTile(el,t);tiles.clear();if(gl){if(texture)gl.deleteTexture(texture);if(buffer)gl.deleteBuffer(buffer);for(const p of programsLive)gl.deleteProgram(p);for(const s of shadersLive)gl.deleteShader(s);canvas.width=canvas.height=1;}programsLive.clear();shadersLive.clear();gl=null;buffer=texture=scene=null;programs={};}
 function compile(type,source){const s=gl.createShader(type);if(!s)throw Error('shader-allocation');shadersLive.add(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('shader-compile');return s;}
 function link(fragment){const v=compile(gl.VERTEX_SHADER,vertex),f=compile(gl.FRAGMENT_SHADER,fragment),p=gl.createProgram();if(!p)throw Error('program-allocation');programsLive.add(p);gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('shader-link');for(const s of [v,f]){gl.deleteShader(s);shadersLive.delete(s);}const uniforms=new Map();for(let i=0;i<gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);i++){const u=gl.getActiveUniform(p,i);uniforms.set(u.name,{type:u.type,loc:gl.getUniformLocation(p,u.name)});}return {p,uniforms};}
 function use(p,values){gl.useProgram(p.p);for(const [name,value]of Object.entries(values)){const u=p.uniforms.get(name);if(!u)continue;if(u.type===gl.SAMPLER_2D)gl.uniform1i(u.loc,value);else if(Array.isArray(value))gl['uniform'+value.length+'fv'](u.loc,value);else gl.uniform1f(u.loc,value);}}
 function init(){
  gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true,powerPreference:'low-power'});if(!gl)throw Error('webgl-unavailable');
  const ext=gl.getExtension('WEBGL_debug_renderer_info');software=!!(ext&&/swiftshader|llvmpipe|software|softpipe/i.test(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)));
  if(software&&!diagnostic)throw Error('software-gpu');
  if(!window.airGlass2Shaders||!window.airGlassGeometry)throw Error('material-assets');
  for(const name of ['liquid','dock','contour'])programs[name]=link(airGlass2Shaders[name]);
  buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 }
 function safeImage(value){
  if(value.startsWith('data:image/svg+xml,')&&typeof AIR_MODERN_CLOUDS==='string'&&decodeURIComponent(value.slice(19))===AIR_MODERN_CLOUDS)return value;
  if(/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+=*$/.test(value)&&value.length<7*1024*1024)return value;
  const u=new URL(value,location.href);if(location.protocol==='file:'&&u.protocol==='file:'&&u.href.startsWith(new URL('.',location.href).href))return u.href;
  if(['http:','https:'].includes(u.protocol)&&u.origin===location.origin&&!u.username&&!u.password)return u.href;
  throw Error('wallpaper-origin');
 }
 async function updateScene(){
  const wall=document.querySelector('.wallpaper');if(!wall)throw Error('wallpaper-missing');const style=getComputedStyle(wall),urlLayer=airGlassGeometry.layers(style.backgroundImage).find(v=>v.startsWith('url(')),raw=urlLayer?.slice(4,-1).trim(),url=raw&&(raw[0]===String.fromCharCode(34)||raw[0]===String.fromCharCode(39)?raw.slice(1,-1):raw);if(!url)throw Error('wallpaper-not-raster');
  const safe=safeImage(url),key=[safe,innerWidth,innerHeight,style.backgroundSize,style.backgroundPosition,style.backgroundImage,getComputedStyle(wall,'::after').backgroundImage].join('|');if(scene?.key===key)return;
  const ticket=epoch,image=new Image();image.src=safe;await image.decode();if(disposed||!gl||ticket!==epoch)return;
  const source=document.createElement('canvas'),scale=Math.min(1,1920/innerWidth);source.width=Math.ceil(innerWidth*scale);source.height=Math.ceil(innerHeight*scale);const ctx=source.getContext('2d');ctx.scale(scale,scale);
  const rect=airGlassGeometry.cover(image.naturalWidth,image.naturalHeight,innerWidth,innerHeight,style.backgroundSize.split(',')[0],style.backgroundPosition.split(',')[0]);ctx.fillStyle=style.backgroundColor||'#18232d';ctx.fillRect(0,0,innerWidth,innerHeight);ctx.filter='blur(2px)';ctx.drawImage(image,rect.x,rect.y,rect.width,rect.height);ctx.filter='none';
  const overlays=airGlassGeometry.layers(style.backgroundImage);for(const layer of overlays.slice(0,overlays.findIndex(v=>v.includes('url('))).reverse())airGlassGeometry.gradient(ctx,layer,innerWidth,innerHeight);
  for(const layer of airGlassGeometry.layers(getComputedStyle(wall,'::after').backgroundImage).reverse())airGlassGeometry.gradient(ctx,layer,innerWidth,innerHeight);
  gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.generateMipmap(gl.TEXTURE_2D);scene={key};sceneBuilds++;
 }
 function tileFor(el){let t=tiles.get(el);if(!t){const c=document.createElement('canvas');c.className='deep-glass-tile';c.setAttribute('aria-hidden','true');t={canvas:c,contents:new Set(),amount:0,from:0,target:0,start:0,mouse:[0,0]};tiles.set(el,t);}
  if(t.canvas.parentNode!==el)el.prepend(t.canvas);el.classList.add('deep-glass-host','glass2-active');if(el.closest('.air-home-window,.air-notes-window'))el.classList.add('glass2-tinted');
  for(const c of t.contents)if(c.parentNode!==el){c.classList.remove('glass2-content','glass2-static-content');t.contents.delete(c);}
  for(const child of el.children)if(child!==t.canvas&&!t.contents.has(child)){if(getComputedStyle(child).position==='static')child.classList.add('glass2-static-content');child.classList.add('glass2-content');t.contents.add(child);}return t;
 }
 function draw(el,t,now){
  const r=el.getBoundingClientRect(),style=getComputedStyle(el),w=el.offsetWidth,h=el.offsetHeight;if(!w||!h||!r.width||!r.height)return;
  const edge=el.matches('.dock')?1:el.id==='air-island-toggle'?2:0,e=edge?12:0,width=w+2*e,diag=software&&diagnostic;
  const ratio=Math.min(devicePixelRatio||1,2,Math.sqrt((diag?16384:500000)/(width*h))),pw=Math.max(1,Math.round(width*ratio)),ph=Math.max(1,Math.round(h*ratio));
  canvas.width=pw;canvas.height=ph;gl.viewport(0,0,pw,ph);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.disable(gl.BLEND);gl.bindTexture(gl.TEXTURE_2D,texture);
  const borderX=parseFloat(style.borderLeftWidth)||0,borderY=parseFloat(style.borderTopWidth)||0;
  Object.assign(t.canvas.style,{left:(-e-borderX)+'px',top:(-borderY)+'px',width:width+'px',height:h+'px',transform:'translateY('+el.scrollTop+'px)'});
  const radiusSource=el.matches('.window-titlebar')?getComputedStyle(el.parentElement):style;
  let corners=['borderTopLeftRadius','borderTopRightRadius','borderBottomRightRadius','borderBottomLeftRadius'].map(k=>parseFloat(radiusSource[k])||0);if(el.matches('.window-titlebar'))corners=[corners[0],corners[1],0,0];
  const p=Math.min(1,Math.max(0,(now-t.start)/220));t.amount=motionReduced()?t.target:t.from+(t.target-t.from)*(1-Math.pow(1-p,3));
  const values={src:0,qt_Opacity:1,itemSize:[width,h],glassSize:[w,h],srcSize:[innerWidth,innerHeight],srcOffset:[r.x-e*r.width/w,r.y],airSourceScale:[r.width/w,r.height/h],airEdgeMode:edge,airEdgeInset:e,airCorners:corners,pad:0,radius:corners[0],bezel:Math.min(26,h*.36),thickness:edge?30:22,dispersion:.11,blurPx:1.5,tintMix:edge===1?.45:edge===2?.60:.70,saturation:1.25,dark:1,debug:0,rim:edge?.65:.50,grain:.006,magnify:edge?.08:.04,shadowAmt:0,rimTint:0,ringW:1.1,flatInner:1};
  if(diagnostic&&!diagnosticRefraction){values.thickness=0;values.magnify=0;values.dispersion=0;}
  use(edge?programs.dock:programs.liquid,values);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);draws++;
  if(t.amount>.002){gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);use(programs.contour,{...values,mouse:[t.mouse[0]+e,t.mouse[1]],cornerR:corners[0],amount:t.amount,spread:Math.max(70,w*.5),tint:[.86,.94,1,1]});gl.drawArrays(gl.TRIANGLE_STRIP,0,4);draws++;}
  if(gl.getError()!==gl.NO_ERROR)throw Error('material-draw');
  t.canvas.width=pw;t.canvas.height=ph;t.canvas.getContext('2d').drawImage(canvas,0,0);transfers++;
 }
 async function paint(){frame=null;if(disposed)return;if(painting){dirty=true;return;}painting=true;const started=performance.now();try{
  await policy;if(disposed)return;
  if(document.documentElement.dataset.desktopTheme!=='modern'||reduced()||document.hidden){release();document.documentElement.dataset.desktopGlass='fallback';return;}if(failed)return;
  if(!gl)init();await updateScene();if(!gl||!scene||disposed)return;
  const now=performance.now();for(const el of document.querySelectorAll(selectors)){
   const r=el.getBoundingClientRect();if(!r.width||!r.height||r.bottom<0||r.top>innerHeight||el.closest('[hidden],[inert]')||getComputedStyle(el).visibility==='hidden')continue;
   draw(el,tileFor(el),now);
  }
  for(const [el,t]of tiles)if(!el.isConnected){removeTile(el,t);tiles.delete(el);}
  document.documentElement.dataset.desktopGlass='webgl';reason='';lastPaint=performance.now();
  if(([...tiles.values()].some(t=>Math.abs(t.amount-t.target)>.003)||[...tiles.keys()].some(el=>el.getAnimations().some(a=>a.playState==='running')))&&!motionReduced()){clearTimeout(settle);settle=setTimeout(()=>{settle=null;schedule();},diagnostic?140:32);}
 }catch(error){failed=true;reason=error.message;release();document.documentElement.dataset.desktopGlass='fallback';document.documentElement.dataset.desktopGlassFallback=reason;}finally{painting=false;paintMs+=performance.now()-started;if(dirty){dirty=false;schedule();}}}
 function schedule(){if(disposed||frame!==null)return;frame=requestAnimationFrame(paint);}
 function reset(){if(!['software-gpu','webgl-unavailable','context-lost'].includes(reason)){failed=false;release();}schedule();}
 const observer=new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'?r.target.matches?.(selectors):!r.target.closest?.('.deep-widget-content')&&[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&!n.matches?.('.deep-glass-tile'))))schedule();});observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','hidden']});
 const theme=new MutationObserver(schedule);theme.observe(document.documentElement,{attributes:true,attributeFilter:['class','data-desktop-theme']});
 function react(target,x,y,active){if(motionReduced())return;const el=target?.closest?.(selectors),t=tiles.get(el);if(!t){if(el&&document.documentElement.dataset.desktopTheme==='modern'&&!reduced()&&performance.now()-fallbackAt>40){fallbackAt=performance.now();const r=el.getBoundingClientRect();el.style.setProperty('--glass2-x',(100*(x-r.x)/r.width)+'%');el.style.setProperty('--glass2-y',(100*(y-r.y)/r.height)+'%');el.classList.toggle('glass2-hover',!!active);}return;}t.mouse=[x-el.getBoundingClientRect().x,y-el.getBoundingClientRect().y];const to=(active||el.contains(document.activeElement)||el.matches(':hover'))?.50:0;if(t.target!==to){t.from=t.amount;t.target=to;t.start=performance.now();}if(performance.now()-lastPaint>(diagnostic?140:40))schedule();else{clearTimeout(settle);settle=setTimeout(()=>{settle=null;schedule();},diagnostic?140:40);}}
 document.addEventListener('scroll',e=>{const t=tiles.get(e.target);if(t)t.canvas.style.transform='translateY('+e.target.scrollTop+'px)';},{capture:true,passive:true,signal});
 document.addEventListener('pointermove',e=>react(e.target,e.clientX,e.clientY,true),{passive:true,signal});document.addEventListener('pointerout',e=>{const el=e.target.closest?.(selectors);if(el&&!el.contains(e.relatedTarget))react(e.target,e.clientX,e.clientY,false);},{signal});
 document.addEventListener('focusin',e=>{const r=e.target.getBoundingClientRect();react(e.target,r.x+r.width/2,r.y,true);},{signal});document.addEventListener('focusout',e=>react(e.target,0,0,false),{signal});
 for(const type of ['resize','pointerup','focus'])window.addEventListener(type,schedule,{signal});document.addEventListener('air-settings-changed',reset,{signal});document.addEventListener('visibilitychange',schedule,{signal});for(const m of media)m.addEventListener('change',schedule,{signal});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();failed=true;reason='context-lost';release();document.documentElement.dataset.desktopGlass='fallback';},{signal});
 function dispose(){disposed=true;if(frame!==null)cancelAnimationFrame(frame);frame=null;clearTimeout(settle);observer.disconnect();theme.disconnect();events.abort();release();}
 document.addEventListener('air-profile-changing',dispose,{once:true,signal});window.addEventListener('pagehide',dispose,{once:true,signal});
 window.airDesktopGlass={snapshot:()=>({failed,reason,diagnostic,software,diagnosticRefraction,draws,sceneBuilds,transfers,tiles:tiles.size,pending:frame!==null||painting||settle!==null,disposed,paintWallTimeMs:Math.round(paintMs),programs:programsLive.size,textures:texture?1:0}),refresh:schedule,setDiagnosticRefraction:enabled=>{if(!diagnostic||typeof enabled!=='boolean')throw Error('isolated-diagnostic-required');diagnosticRefraction=enabled;schedule();}};schedule();
})();

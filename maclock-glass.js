/* MacLock materials port: Copyright (c) 2026 Rickky, MIT.
 * Original Glass.qml / LockScreen.qml parameters and fragment math retained.
 * WebGL2/Canvas/DOM lifecycle adaptation: Air-OS. No auth/IPC/secret access.
 * Notices and unmodified sources: third_party/maclock/.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else {root.airMacLockGlass=api;root.airMacLockGlassController=api.mount(root);}
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function parameters(height,fieldHeight){
  const u=Math.max(.6,height/1200),clockPx=176*u;
  return {scene:{scale:.5,blurMax:32,blur:.35},clock:{mode:1,intensity:.6,refractPx:(6+4*(1-.6))*u,bevel:4.5,tint:[1,1,1,1],lightDir:[-.6,-.8],padding:Math.max(48*u,clockPx*.5),heightRadius:16*Math.max(.12,Math.min(.6,clockPx*.04/16))},field:{pad:10,radius:fieldHeight/2,bezel:Math.min(fieldHeight*.36,26),thickness:18*1.6,dispersion:.06*1.3,magnify:.05*1.6,rim:.5,grain:.006,blurPx:1.5,tintMix:.50*.55,saturation:1.25,dark:1,debug:0,shadowAmt:.4}};
 }
 function createRenderer(canvas,sources){
  const gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,preserveDrawingBuffer:false,powerPreference:'low-power'});
  if(!gl)throw Error('webgl2-unavailable');
  const live={shader:new Set(),program:new Set(),texture:new Set(),buffer:new Set(),framebuffer:new Set(),vertexArray:new Set()};
  const create=(kind,fn)=>{const v=fn();if(!v)throw Error('webgl-allocation');live[kind].add(v);return v};
  function drop(kind,v){if(v&&live[kind].delete(v))gl['delete'+kind[0].toUpperCase()+kind.slice(1)](v)}
  let disposed=false,scene=null,mask=null,hmap=null,movingScene=null,sceneSize=null,motionKey='';const programs={};
  function destroy(lose=true){
   if(disposed)return;disposed=true;
   for(const kind of Object.keys(live))for(const v of [...live[kind]])drop(kind,v);
   scene=mask=hmap=movingScene=null;
   if(lose&&!gl.isContextLost())gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
  function compile(type,source){const s=create('shader',()=>gl.createShader(type));gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('shader-compile: '+gl.getShaderInfoLog(s));return s}
  function program(fragment){
   const vertex=compile(gl.VERTEX_SHADER,sources.vertex),pixel=compile(gl.FRAGMENT_SHADER,fragment),p=create('program',()=>gl.createProgram());
   gl.attachShader(p,vertex);gl.attachShader(p,pixel);gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('shader-link: '+gl.getProgramInfoLog(p));
   drop('shader',vertex);drop('shader',pixel);
   const uniforms=new Map();for(let i=0;i<gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);i++){const u=gl.getActiveUniform(p,i);uniforms.set(u.name,{type:u.type,location:gl.getUniformLocation(p,u.name)})}
   return{p,uniforms};
  }
  function use(p,values){
   gl.useProgram(p.p);
   for(const [name,value] of Object.entries(values)){
    const u=p.uniforms.get(name);if(!u)continue;
    if(u.type===gl.SAMPLER_2D||u.type===gl.BOOL||u.type===gl.INT)gl.uniform1i(u.location,value);
    else if(Array.isArray(value))gl['uniform'+value.length+'fv'](u.location,value);
    else gl.uniform1f(u.location,value);
   }
  }
  function texture(width,height,image){
   if(Math.max(width,height)>gl.getParameter(gl.MAX_TEXTURE_SIZE))throw Error('texture-size');
   const t=create('texture',()=>gl.createTexture());gl.bindTexture(gl.TEXTURE_2D,t);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
   if(image)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
   else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
   return t;
  }
  const bind=(t,unit=0)=>{gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t)};
  let framebuffer,vao;
  function blur(input,width,height,radius){
   const temp=texture(width,height),out=texture(width,height);
   gl.disable(gl.BLEND);gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.viewport(0,0,width,height);
   for(const [source,target,direction] of [[input,temp,[1/width,0]],[temp,out,[0,1/height]]]){
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,target,0);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('framebuffer-incomplete');
    bind(source);use(programs.blur,{toScreen:0,src:0,stepPx:direction,radius});gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
   }
   gl.bindFramebuffer(gl.FRAMEBUFFER,null);drop('texture',temp);return out;
  }
  try{
   programs.blur=program(sources.blur);programs.clock=program(sources.glasstext);programs.field=program(sources.liquidglass);if(sources.motionScene)programs.motion=program(sources.motionScene);
   vao=create('vertexArray',()=>gl.createVertexArray());gl.bindVertexArray(vao);
   const buffer=create('buffer',()=>gl.createBuffer());gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
   framebuffer=create('framebuffer',()=>gl.createFramebuffer());
  }catch(error){destroy();throw error}
  function setScene(image,radius){
   if(disposed)throw Error('renderer-disposed');
   gl.bindVertexArray(vao);drop('texture',scene);drop('texture',movingScene);movingScene=null;motionKey='';sceneSize={width:image.width,height:image.height};
   const raw=texture(image.width,image.height,image);scene=blur(raw,image.width,image.height,radius);drop('texture',raw);
   bind(scene);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  }
  function setMask(image,radius){
   if(disposed)throw Error('renderer-disposed');
   gl.bindVertexArray(vao);drop('texture',mask);drop('texture',hmap);mask=texture(image.width,image.height,image);hmap=blur(mask,image.width,image.height,radius);
  }
  function draw({width,height,dpr=1,clockRect,fieldRect,params,sceneState,validate=true}){
   if(disposed||!scene||!mask||!hmap||gl.isContextLost())throw Error('renderer-not-ready');
   let backdrop=scene;
   if(sceneState&&programs.motion&&(Math.abs(sceneState.zoom-1)>1e-7||sceneState.blur>1e-7)){
    const key=[sceneState.zoom,sceneState.blur,sceneState.blurOpacity].join('|');
    const fresh=!movingScene;if(fresh)movingScene=texture(sceneSize.width,sceneSize.height);
    if(key!==motionKey){
     gl.bindVertexArray(vao);gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,movingScene,0);
     if(fresh&&gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('motion-framebuffer');
     gl.disable(gl.BLEND);gl.viewport(0,0,sceneSize.width,sceneSize.height);bind(scene,0);
     use(programs.motion,{toScreen:0,src:0,zoom:sceneState.zoom,blurControl:sceneState.blur,blurOpacity:sceneState.blurOpacity});gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
     bind(movingScene,0);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);motionKey=key;
    }
    backdrop=movingScene;
   }else if(movingScene){drop('texture',movingScene);movingScene=null;motionKey=''}
   const w=Math.round(width*dpr),h=Math.round(height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
   gl.bindVertexArray(vao);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
   function viewport(r){gl.viewport(Math.round(r.x*dpr),Math.round((height-r.y-r.height)*dpr),Math.round(r.width*dpr),Math.round(r.height*dpr))}
   viewport(clockRect);bind(backdrop,0);bind(mask,1);bind(hmap,2);
   const {heightRadius,padding,...clock}=params.clock;
   use(programs.clock,{toScreen:1,qt_Opacity:sceneState?sceneState.opacity*sceneState.clockOpacity:1,itemSize:[clockRect.width,clockRect.height],srcSize:[width,height],srcOffset:[clockRect.x,clockRect.y],src:0,mask:1,hmap:2,...clock});gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
   const p=params.field.pad,field={x:fieldRect.x-p,y:fieldRect.y-p,width:fieldRect.width+2*p,height:fieldRect.height+2*p};
   viewport(field);bind(backdrop,0);
   use(programs.field,{toScreen:1,qt_Opacity:sceneState?sceneState.opacity*sceneState.loginOpacity:1,itemSize:[field.width,field.height],glassSize:[fieldRect.width,fieldRect.height],srcSize:[width,height],srcOffset:[field.x,field.y],src:0,...params.field});gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
   if(validate&&gl.getError()!==gl.NO_ERROR)throw Error('webgl-draw');
  }
  return Object.freeze({setScene,setMask,draw,destroy,snapshot:()=>({disposed,contextAlive:!disposed&&!gl.isContextLost(),resources:Object.fromEntries(Object.entries(live).map(([k,v])=>[k,v.size]))})});
 }
 function mount(win){
  const doc=win.document,body=doc.body,clock=doc.querySelector('#login-clock'),field=doc.querySelector('.password-row'),toggle=doc.querySelector('#maclock-reduce-glass');
  const media=[win.matchMedia('(forced-colors: active)'),win.matchMedia('(prefers-reduced-transparency: reduce)'),win.matchMedia('(prefers-contrast: more)')];
  let disposed=false,ready=false,manual=false,failed=false,renderer=null,canvas=null,surfaceEvents=null,frame=null,frames=0,maskRebuilds=0,sceneRebuilds=0,generation=0,sceneKey='',maskKey='',classKey='',last=null;
  let state={status:'loading',reason:'assets'};const events=new win.AbortController(),image=new win.Image();
  const listen=(target,type,fn)=>target.addEventListener(type,fn,{signal:events.signal});
  function status(value,reason){const changed=state.status!==value||state.reason!==reason;state={status:value,reason};body.dataset.maclockGlass=value;if(changed)doc.dispatchEvent(new win.CustomEvent('air-maclock-material-state',{detail:{status:value,reason}}))}
  function release(value,reason){
   generation++;if(frame!==null)win.cancelAnimationFrame(frame);frame=null;
   body.classList.remove('has-maclock-glass');
   surfaceEvents?.abort();surfaceEvents=null;
   if(renderer){renderer.destroy();renderer=null}if(canvas){canvas.remove();canvas=null}
   sceneKey=maskKey='';status(value,reason);
  }
  function reduced(){return manual||media.some(m=>m.matches)||doc.documentElement.classList.contains('air-reduced-glass')||body.classList.contains('air-reduced-glass')}
  function schedule(){if(disposed||frame!==null)return;const owner=generation;let ticket;ticket=win.requestAnimationFrame(()=>{if(disposed||owner!==generation||frame!==ticket)return;render()});frame=ticket}
  function makeScene(width,height){
   const c=doc.createElement('canvas');c.width=Math.max(1,Math.round(width/2));c.height=Math.max(1,Math.round(height/2));const cx=c.getContext('2d',{alpha:false});if(!cx)throw Error('canvas2d-unavailable');
   const scale=Math.max(c.width/image.naturalWidth,c.height/image.naturalHeight),iw=image.naturalWidth*scale,ih=image.naturalHeight*scale;
   cx.drawImage(image,(c.width-iw)/2,(c.height-ih)/2,iw,ih);
   const gradient=cx.createLinearGradient(0,0,0,c.height);for(const [p,a] of [[0,.22],[.35,0],[.72,0],[1,.30]])gradient.addColorStop(p,'rgba(0,0,0,'+a+')');cx.fillStyle=gradient;cx.fillRect(0,0,c.width,c.height);return c;
  }
  function makeMask(rect,style,padding,dpr){
   const c=doc.createElement('canvas');c.width=Math.ceil((rect.width+2*padding)*dpr);c.height=Math.ceil((rect.height+2*padding)*dpr);const cx=c.getContext('2d');if(!cx)throw Error('canvas2d-unavailable');cx.scale(dpr,dpr);
   cx.font=style.fontWeight+' '+style.fontSize+' '+style.fontFamily;cx.fillStyle='#fff';cx.textBaseline='alphabetic';
   if('letterSpacing' in cx)cx.letterSpacing=style.letterSpacing;
   const text=clock.textContent,metrics=cx.measureText(text),baseline=padding+metrics.fontBoundingBoxAscent;
   if('letterSpacing' in cx)cx.fillText(text,padding,baseline);
   else {let x=padding;for(const char of text){cx.fillText(char,x,baseline);x+=cx.measureText(char).width+parseFloat(style.letterSpacing)}}
   return c;
  }
  function render(){
   frame=null;if(disposed)return;
   toggle.disabled=media.some(m=>m.matches);toggle.setAttribute('aria-pressed',String(reduced()));
   if(doc.hidden){release('hidden','document-hidden');return}
   if(reduced()){release('reduced','accessibility');return}
   if(body.classList.contains('is-creating')){release('hidden','account-creation');return}
   if(!ready||failed)return;
   try{
    if(!renderer){
     const owner=++generation;canvas=doc.createElement('canvas');canvas.className='maclock-material';canvas.setAttribute('aria-hidden','true');body.appendChild(canvas);
     surfaceEvents=new win.AbortController();canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();if(owner!==generation||disposed)return;failed=true;release('fallback','context-lost')},{signal:surfaceEvents.signal});
     renderer=createRenderer(canvas,win.airMacLockShaders);
    }
    const width=win.innerWidth,height=win.innerHeight,dpr=Math.min(2,win.devicePixelRatio||1),range=doc.createRange();range.selectNodeContents(clock);const r=range.getBoundingClientRect(),f=field.getBoundingClientRect(),style=win.getComputedStyle(clock),params=parameters(height,f.height);
    const nextScene=width+'x'+height;if(sceneKey!==nextScene){renderer.setScene(makeScene(width,height),params.scene.blurMax*params.scene.blur);sceneKey=nextScene;sceneRebuilds++}
    const nextMask=[clock.textContent,style.fontFamily,style.fontSize,style.fontWeight,style.letterSpacing,Math.round(r.width*dpr),Math.round(r.height*dpr),dpr].join('|');
    if(maskKey!==nextMask){renderer.setMask(makeMask(r,style,params.clock.padding,dpr),params.clock.heightRadius*dpr);maskKey=nextMask;maskRebuilds++}
    const padding=params.clock.padding,clockRect={x:r.x-padding,y:r.y-padding,width:Math.ceil((r.width+2*padding)*dpr)/dpr,height:Math.ceil((r.height+2*padding)*dpr)/dpr},fieldRect={x:f.x,y:f.y,width:f.width,height:f.height};
    const motion=win.airMacLockMotionController?.snapshot(),sceneState=motion?.values,validate=!motion?.active||frames===0;
    renderer.draw({width,height,dpr,clockRect,fieldRect,params,sceneState,validate});last={width,height,dpr,clockRect,fieldRect,params,sceneState,validate};frames++;
    body.classList.add('has-maclock-glass');status('webgl','ready');
   }catch(error){failed=true;release('fallback',String(error.message||'material-error'))}
  }
  function checkClasses(){
   const next=[body.classList.contains('is-creating'),body.classList.contains('is-engaged'),body.classList.contains('has-password'),body.classList.contains('air-reduced-glass'),doc.documentElement.classList.contains('air-reduced-glass')].join('|');
   if(next!==classKey){classKey=next;schedule()}
  }
  const observer=new win.MutationObserver(checkClasses);observer.observe(body,{attributes:true,attributeFilter:['class']});observer.observe(doc.documentElement,{attributes:true,attributeFilter:['class']});
  let oldTime=clock.textContent;const textObserver=new win.MutationObserver(()=>{if(clock.textContent!==oldTime){oldTime=clock.textContent;schedule()}});textObserver.observe(clock,{childList:true,characterData:true,subtree:true});
  const resize=new win.ResizeObserver(schedule);for(const e of [clock,field,doc.querySelector('#login-stage')])resize.observe(e);
  for(const m of media)listen(m,'change',()=>{failed=false;schedule()});
  listen(doc,'air-maclock-frame',()=>{if(disposed)return;if(frame!==null)win.cancelAnimationFrame(frame);frame=null;render()});
  listen(win,'resize',schedule);listen(doc,'visibilitychange',schedule);
  listen(toggle,'click',()=>{manual=!manual;failed=false;schedule()});
  function destroy(){if(disposed)return;disposed=true;observer.disconnect();textObserver.disconnect();resize.disconnect();events.abort();image.onload=image.onerror=null;release('disposed','pagehide');image.removeAttribute('src')}
  listen(win,'pagehide',destroy);
  image.src='maclock-wallpaper.svg';
  Promise.all([image.decode(),doc.fonts.ready]).then(()=>{if(!disposed){ready=true;schedule()}}).catch(()=>{if(!disposed){failed=true;release('fallback','assets-unavailable')}});
  checkClasses();
  return Object.freeze({destroy,snapshot:()=>({...state,disposed,frames,maskRebuilds,sceneRebuilds,pendingFrame:frame!==null,last,renderer:renderer?.snapshot()||{disposed:true,contextAlive:false,resources:{shader:0,program:0,texture:0,buffer:0,framebuffer:0,vertexArray:0}}})});
 }
 return Object.freeze({parameters,createRenderer,mount});
});

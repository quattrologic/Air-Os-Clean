'use strict';
// Shared demand-driven WebGL2 renderer. Original MacShell equations in separate shader.
(() => {
 const selectors='.dock,#air-island-toggle,#air-island-panel,.air-calendar-panel,.air-search-dialog,.app-window,.deep-widget,.deep-history,.deep-dock-menu';
 const canvas=document.createElement('canvas');let gl,program,texture,buffer,failed=false,pending=false,draws=0,scene=null,disposed=false,painting=false,dirty=false;
 const tiles=new Map(),media=matchMedia('(prefers-reduced-transparency: reduce)'),forced=matchMedia('(forced-colors: active)');
 function release(){for(const [el,t]of tiles){t.remove();el.classList.remove('deep-glass-host');}tiles.clear();if(gl){if(texture)gl.deleteTexture(texture);if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);canvas.width=canvas.height=1;}gl=null;scene=null;program=texture=buffer=null;}
 function init(){
  gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true,powerPreference:'low-power'});if(!gl)throw Error('webgl-unavailable');
  const ext=gl.getExtension('WEBGL_debug_renderer_info');if(ext&&/swiftshader|llvmpipe|software/i.test(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)))throw Error('software-gpu');
  const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw Error('compile');}return s;};
  const v=compile(gl.VERTEX_SHADER,'#version 300 es\nlayout(location=0) in vec2 p;out vec2 qt_TexCoord0;void main(){gl_Position=vec4(p,0.,1.);qt_TexCoord0=vec2((p.x+1.)*.5,1.-(p.y+1.)*.5);}');let f;try{f=compile(gl.FRAGMENT_SHADER,airDesktopGlassFragment);program=gl.createProgram();gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');}finally{gl.deleteShader(v);if(f)gl.deleteShader(f);}
  buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 }
 async function paint(){pending=false;if(disposed)return;
  if(document.documentElement.dataset.desktopTheme!=='modern'||readAirSettings().reduceGlass||media.matches||forced.matches||document.hidden){release();return;}
  if(failed)return;
  if(painting){dirty=true;return;}painting=true;
  try{
   if(!gl)init();
   const wall=document.querySelector('.wallpaper'),background=getComputedStyle(wall).backgroundImage;
   const url=background.match(/url\(["']?(.*?)["']?\)/)?.[1];if(!url)throw Error('no-raster-wallpaper');
   const target=new URL(url,location.href);if(target.origin!==location.origin||!['file:','http:','https:'].includes(target.protocol))throw Error('unsupported-wallpaper');
   if(!scene||scene.key!==url+'|'+innerWidth+'|'+innerHeight){const image=new Image();image.src=url;await image.decode();if(disposed||!gl)return;const source=document.createElement('canvas');source.width=innerWidth;source.height=innerHeight;const ctx=source.getContext('2d'),scale=Math.max(innerWidth/image.width,innerHeight/image.height);ctx.filter='blur(5px)';ctx.drawImage(image,(innerWidth-image.width*scale)/2,(innerHeight-image.height*scale)/2,image.width*scale,image.height*scale);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.generateMipmap(gl.TEXTURE_2D);scene={key:url+'|'+innerWidth+'|'+innerHeight};}
   gl.useProgram(program);
   const uniform=(n,v)=>{const loc=gl.getUniformLocation(program,n);if(loc===null)return;if(Array.isArray(v))gl.uniform2fv(loc,v);else if(n==='src')gl.uniform1i(loc,v);else gl.uniform1f(loc,v);};
   for(const el of document.querySelectorAll(selectors)){
    const r=el.getBoundingClientRect();if(!r.width||!r.height||el.closest('[hidden],[inert]')||getComputedStyle(el).display==='none')continue;
    let tile=tiles.get(el);if(!tile){tile=document.createElement('canvas');tile.className='deep-glass-tile';tile.setAttribute('aria-hidden','true');el.prepend(tile);el.classList.add('deep-glass-host');tiles.set(el,tile);}
    const w=Math.round(r.width),h=Math.round(r.height);canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);gl.useProgram(program);gl.bindTexture(gl.TEXTURE_2D,texture);
    const values={src:0,qt_Opacity:1,itemSize:[w,h],glassSize:[w,h],srcSize:[innerWidth,innerHeight],srcOffset:[r.x,r.y],pad:0,radius:parseFloat(getComputedStyle(el).borderTopLeftRadius)||24,bezel:Math.min(26,h*.36),thickness:22,dispersion:.06,blurPx:5,tintMix:.42,saturation:1.15,dark:1,debug:0,rim:.45,grain:.03,magnify:.05,shadowAmt:0,rimTint:1,ringW:1.4,flatInner:1,...(el.matches('.dock')?{thickness:30,dispersion:.06,magnify:.08,rim:.45*.20,grain:.03*.3,blurPx:1.5,tintMix:.42*.55,saturation:1.25,rimTint:0,ringW:0,flatInner:0}:el.matches('.deep-widget')?{thickness:30,magnify:.08*Math.min(1,90/h),blurPx:1,tintMix:Math.min(.92,.25+.42*.8)}: {})};for(const [k,v]of Object.entries(values))uniform(k,v);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);draws++;tile.width=w;tile.height=h;tile.getContext('2d').drawImage(canvas,0,0);
   }
   for(const [el,t]of tiles)if(!el.isConnected){t.remove();tiles.delete(el);}
  }catch(error){failed=true;release();document.documentElement.dataset.desktopGlassFallback=error.message;}finally{painting=false;if(dirty){dirty=false;schedule();}}
 }
 function schedule(){if(!pending&&!disposed){pending=true;requestAnimationFrame(paint);}}
 const observer=new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'?r.target.matches?.(selectors):r.target.closest?.('.deep-widget-content')?false:[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&!n.matches?.('.deep-glass-tile'))))schedule();});observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','hidden','class']});
 const theme=new MutationObserver(schedule);theme.observe(document.documentElement,{attributes:true,attributeFilter:['class','data-desktop-theme']});
 for(const type of ['resize','pointerup','focus'])window.addEventListener(type,schedule);document.addEventListener('air-settings-changed',schedule);document.addEventListener('visibilitychange',schedule);media.addEventListener('change',schedule);forced.addEventListener('change',schedule);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();failed=true;release();});
 function dispose(){disposed=true;observer.disconnect();theme.disconnect();release();}
 document.addEventListener('air-profile-changing',dispose);window.addEventListener('pagehide',dispose);window.airDesktopGlass={snapshot:()=>({failed,draws,tiles:tiles.size,pending,disposed}),refresh:schedule};schedule();
})();

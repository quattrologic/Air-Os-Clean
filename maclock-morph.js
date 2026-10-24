/* MacLock MorphText / LockScreen behavior port, Copyright (c) 2026 Rickky, MIT.
 * Pinned original: 1bdb51870b621100fd2709f66c8f8e00ab17b9c4.
 * DOM/compositor adaptation; public clock/static UI strings only, never input values. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.airMacLockMorph=api;root.airMacLockMorphController=api.mount(root)}})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),quint=t=>1-(1-clamp(t))**5,cubic=t=>1-(1-clamp(t))**3,quad=t=>t<.5?2*t*t:1-(-2*t+2)**2/2;
 const TEXT=Object.freeze({duration:420,alignDuration:650,blurMax:44,scaleIn:1.06,scaleOut:.94,stretch:true,animateWidth:true,useBlur:true});
 const CLOCK=Object.freeze({...TEXT,duration:560,blurMax:48,scaleIn:1.03,scaleOut:.97,stretch:false,animateWidth:false,useBlur:false});
 const SHAKE=Object.freeze([[-16,55,'quint'],[14,80,'quad'],[-10,75,'quad'],[7,70,'quad'],[-3,65,'quad'],[0,90,'quint']]);
 const ease={quint,cubic,quad,linear:t=>clamp(t)};
 function motion(initial={}){
  const values={...initial},tracks=new Map();
  function sample(now){for(const[k,t]of tracks){const p=clamp((now-t.start)/t.duration);values[k]=t.from+(t.to-t.from)*ease[t.ease](p);if(p===1){values[k]=t.to;tracks.delete(k)}}return{...values}}
  function target(k,to,duration,curve,now,instant=false){sample(now);if(tracks.get(k)?.to===to&&!instant)return;if(instant||!duration||Math.abs((values[k]??to)-to)<1e-10){values[k]=to;tracks.delete(k)}else tracks.set(k,{from:values[k],to,duration,ease:curve,start:now})}
  function finish(){for(const[k,t]of tracks)values[k]=t.to;tracks.clear();return{...values}}
  return{values,sample,target,finish,active:()=>tracks.size>0,cancel:()=>tracks.clear(),tracks:()=>Object.fromEntries(tracks)};
 }
 function textModel(text,width,options={}){
  const p={...TEXT,...options},layers=[{text,width},{text:'',width:1}],m=motion({width,align:.5,morphBlur:0,'0.opacity':1,'0.blur':0,'0.scale':1,'0.sx':1,'1.opacity':0,'1.blur':1,'1.scale':p.scaleIn,'1.sx':1});let current=0,revision=0;
  function set(next,w,now,instant=false){
   if(layers[current].text===next)return false;const s=m.sample(now),wasActive=m.active();let incoming=layers.findIndex(l=>l.text===next);if(incoming<0)incoming=s['0.opacity']<s['1.opacity']?0:1;const outgoing=1-incoming,newContent=layers[incoming].text!==next,old=layers[outgoing];
   layers[incoming]={text:next,width:w};current=incoming;revision++;
   const wo=Math.max(1,old.width*s[outgoing+'.sx']),inSx=p.stretch?clamp(wo/Math.max(1,w),.35,2.5):1,outSx=p.stretch?clamp(w/Math.max(1,old.width),.35,2.5):1;
   if(newContent&&s[incoming+'.opacity']<.001){Object.assign(m.values,{[incoming+'.opacity']:0,[incoming+'.blur']:1,[incoming+'.scale']:p.scaleIn,[incoming+'.sx']:inSx})}
   if(!wasActive)m.values.morphBlur=1;
   for(const[k,to,d,curve]of [[outgoing+'.sx',outSx,p.duration,'quint'],[outgoing+'.opacity',0,p.duration*.75,'cubic'],[outgoing+'.blur',1,p.duration*.75,'cubic'],[outgoing+'.scale',p.scaleOut,p.duration,'quint'],[incoming+'.sx',1,p.duration,'quint'],[incoming+'.opacity',1,p.duration,'quint'],[incoming+'.blur',0,p.duration,'quint'],[incoming+'.scale',1,p.duration,'quint'],['width',w,p.animateWidth?p.duration:0,'quint'],['morphBlur',0,p.duration,'quint']])m.target(k,to,d,curve,now,instant);
   return true;
  }
  return{set,sample:now=>({values:m.sample(now),layers:layers.map(l=>({...l})),current,revision,params:p,active:m.active()}),align:(a,now)=>m.target('align',a,p.alignDuration,'quint',now),finish:m.finish,active:m.active,cancel:m.cancel};
 }
 function mount(win){
  const doc=win.document,body=doc.body,$=s=>doc.querySelector(s),clock=$('#login-clock'),date=$('#maclock-date'),hint=$('#login-hint'),errorNode=$('#login-error'),field=$('.password-row'),caps=$('#login-caps'),submit=$('#login-submit'),media=win.matchMedia('(prefers-reduced-motion: reduce)'),events=new win.AbortController();
  const listen=(e,t,fn)=>e.addEventListener(t,fn,{signal:events.signal}),now=()=>win.performance.now();let disposed=false,frame=null,generation=0,paints=0,shakeStart=null,shakeFrom=0,pressed=false,key='',clockWaiting=false,paintTime=null,fieldWasActive=false,fieldSprite=null,spriteSource=null;
  const scalar=motion({shake:0,sx:1,sy:1,capsOpacity:0,capsScale:.5,goOpacity:0,goScale:.4,hintOpacity:0});const views=[];let clockView=null;
  function reduced(){return media.matches||body.classList.contains('air-reduced-motion')||doc.documentElement.classList.contains('air-reduced-motion')}
  function rangeRect(node){const r=doc.createRange();r.selectNodeContents(node);return r.getBoundingClientRect()}
  function makeView(node,options,kind){
   const rect=rangeRect(node),host=doc.createElement('div');host.className='maclock-morph-host maclock-morph-'+kind;host.setAttribute('aria-hidden','true');body.appendChild(host);
   const measure=doc.createElement('span'),style=win.getComputedStyle(node);measure.className='maclock-morph-measure';measure.style.font=style.font;measure.style.letterSpacing=style.letterSpacing;host.appendChild(measure);
   const width=text=>{measure.textContent=text;const hidden=host.hidden;host.hidden=false;const w=measure.getBoundingClientRect().width||rect.width||1;host.hidden=hidden;return w};
   const model=textModel(node.textContent,width(node.textContent),options),elements=[0,1].map(()=>{const box=doc.createElement('div');box.className='maclock-morph-layer';const crisp=doc.createElement('span'),soft=doc.createElement('span');crisp.className='maclock-morph-crisp';soft.className='maclock-morph-soft';box.append(crisp,soft);host.appendChild(box);return{box,crisp,soft,content:null,tile:null}});
   const v={node,host,model,elements,width,kind,style,visible:false,tiles:new Map(),rect,startedAt:null};views.push(v);return v;
  }
  function setup(){if(disposed)return;body.classList.add('maclock-morph-enabled');fieldSprite=doc.createElement('canvas');fieldSprite.className='maclock-field-sprite';fieldSprite.setAttribute('aria-hidden','true');field.prepend(fieldSprite);clockView=makeView(clock,CLOCK,'clock');makeView(date,TEXT,'date');makeView(hint,TEXT,'hint');sync();}
  function getTile(){return win.airMacLockGlassController?.clockTile?.()||null}
  function setText(v,text){
   if(!v||disposed)return;const at=now();if(v.model.sample(at).layers[v.model.sample(at).current].text===text)return;
   if(v.kind==='clock'){
    const tile=getTile();if(tile)v.tiles.set(tile.text,tile);clockWaiting=body.classList.contains('has-maclock-glass')&&!reduced()&&!doc.hidden&&!win.airMacLockMotionController?.snapshot().active;
    if(clockWaiting)return;
   }
   v.model.set(text,v.width(text),at,reduced()||doc.hidden||!win.airMacLockMotionController?.snapshot().ready||win.airMacLockMotionController.snapshot().active);
   if(v.kind!=='clock'||!clockWaiting){v.visible=v.model.active();v.startedAt=at;paint();queue()}
  }
  function clockText(text,day,iso){
   if(disposed)return;clock.dateTime=iso;const d=views.find(v=>v.node===date);setText(d,day);date.textContent=day;
   if(clock.textContent!==text){setText(clockView,text);clock.textContent=text;}
  }
  function tileReady(){
   if(!clockView||disposed)return;const tile=getTile();if(tile)clockView.tiles.set(tile.text,tile);
   if(clockWaiting&&tile?.text===clock.textContent){
    // Start after the one required new-content material draw, never consume the morph while compiling/rasterizing.
    clockWaiting=false;clockView.model.set(tile.text,clockView.width(tile.text),now(),reduced()||doc.hidden);clockView.visible=clockView.model.active();clockView.startedAt=now();paint();queue();
   }
  }
  function fieldPress(value){if(disposed||pressed===value)return;pressed=value;const t=now(),d=value?140:420;scalar.target('sx',value?1.045:1,d,'quint',t,reduced());scalar.target('sy',value?.86:1,d,'quint',t,reduced());paint();queue()}
  function rejected(){if(disposed)return;shakeFrom=scalar.sample(now()).shake;shakeStart=reduced()||doc.hidden?null:now();sync();paint();queue()}
  function sync(){
   if(disposed)return;const next=[body.classList.contains('is-auth-busy'),body.classList.contains('has-password'),body.classList.contains('is-engaged'),caps.hidden,errorNode.hidden,reduced(),body.classList.contains('is-creating')].join('|');if(next===key)return;key=next;const busy=body.classList.contains('is-auth-busy'),on=busy||body.classList.contains('has-password'),t=now();
   scalar.target('capsOpacity',caps.hidden?0:.9,180,'linear',t,reduced());scalar.target('capsScale',caps.hidden?.5:1,300,'quint',t,reduced());scalar.target('goOpacity',on?1:0,200,'linear',t,reduced());scalar.target('goScale',on?1:.4,340,'quint',t,reduced());
   scalar.target('hintOpacity',body.classList.contains('is-engaged')||!errorNode.hidden?1:0,300,'linear',t,reduced());
   hint.style.setProperty('--maclock-hint-color',errorNode.hidden?'rgba(255,255,255,.55)':'rgba(255,199,194,.95)');
   const h=views.find(v=>v.kind==='hint');const message=busy?'Anmeldung wird geprüft …':errorNode.hidden?'Air-OS-Passwort zum Anmelden eingeben.':'Anmeldung fehlgeschlagen. Bitte erneut versuchen.';setText(h,message);hint.textContent=message;
   if(reduced()||doc.hidden||body.classList.contains('is-creating'))settle();paint();queue();
  }
  function settle(){for(const v of views){v.model.finish();v.model.set(v.node.textContent,v.width(v.node.textContent),now(),true);v.visible=false;v.tiles.clear();for(const e of v.elements){e.crisp.replaceChildren();e.soft.textContent='';e.tile=null;e.content=null}}if(fieldSprite){fieldSprite.width=fieldSprite.height=1}spriteSource=null;clockWaiting=false;scalar.finish();scalar.values.shake=0;scalar.values.sx=1;scalar.values.sy=1;shakeStart=null;pressed=false;if(frame!==null)win.cancelAnimationFrame(frame);frame=null;generation++}
  function paint(){
   if(disposed)return;const t=now(),u=Math.max(.6,win.innerHeight/1200),s=scalar.sample(t);paints++;paintTime=t;
   if(shakeStart!==null){let elapsed=t-shakeStart,from=shakeFrom;for(const[to,d,curve]of SHAKE){if(elapsed<=d){s.shake=from+(to*u-from)*ease[curve](elapsed/d);break}elapsed-=d;from=to*u;s.shake=from}if(t-shakeStart>=435){shakeStart=null;s.shake=0}scalar.values.shake=s.shake}
   const fieldActive=shakeStart!==null||Math.abs(s.sx-1)>1e-7||Math.abs(s.sy-1)>1e-7;
   field.style.setProperty('--maclock-shake',s.shake+'px');field.style.setProperty('--maclock-press-x',s.sx);field.style.setProperty('--maclock-press-y',s.sy);
   hint.style.setProperty('--maclock-hint-opacity',s.hintOpacity);caps.setAttribute('aria-hidden',String(caps.hidden));caps.style.opacity=s.capsOpacity;caps.style.transform=`scale(${s.capsScale})`;submit.style.opacity=s.goOpacity;submit.inert=!body.classList.contains('has-password')&&!body.classList.contains('is-auth-busy');submit.style.setProperty('--maclock-go-visible',s.goOpacity>.001?'visible':'hidden');submit.style.transform=`scale(${s.goScale})`;
   // Bounded compositor fallback for a moving password pill: no password raster, no extra GPU draw per shake frame.
   body.classList.toggle('maclock-field-morph',fieldActive);
   const fieldTile=getTile()?.field;
   if(fieldActive&&fieldSprite&&fieldTile&&fieldTile.canvas!==spriteSource){spriteSource=fieldTile.canvas;fieldSprite.width=fieldTile.canvas.width;fieldSprite.height=fieldTile.canvas.height;fieldSprite.getContext('2d').drawImage(fieldTile.canvas,0,0)}
   body.classList.toggle('maclock-field-snapshot',fieldActive&&!!fieldTile);
   if(fieldWasActive&&!fieldActive&&body.classList.contains('has-maclock-glass'))doc.dispatchEvent(new win.Event('air-maclock-visual-settled'));
   fieldWasActive=fieldActive;
   const holes=[];
   if(fieldActive){const r=field.getBoundingClientRect(),pad=34;holes.push({x:r.x-pad,y:r.y-pad,width:r.width+pad*2,height:r.height+pad*2})}
   for(const v of views){
    const snap=v.model.sample(t);v.visible=v.visible&&snap.active;const active=v.visible;
    v.host.hidden=!active;v.node.classList.toggle('maclock-morph-source',active);
    if(!active){if(v.kind==='clock'&&!clockWaiting){const tile=getTile();v.tiles.clear();if(tile)v.tiles.set(tile.text,tile)}continue}
    const rect=rangeRect(v.node),style=win.getComputedStyle(v.node),values=snap.values;v.rect={x:rect.x,y:rect.y,width:rect.width,height:rect.height};v.host.style.cssText=`text-shadow:${style.textShadow};left:${rect.x+rect.width/2-values.width/2}px;top:${rect.y}px;width:${values.width}px;height:${rect.height}px;font:${style.font};letter-spacing:${style.letterSpacing};color:${v.kind==='clock'?'rgba(255,255,255,.85)':style.color};`;
    if(v.kind==='hint')v.host.style.setProperty('--maclock-layer-opacity',s.hintOpacity);
    if(v.kind==='clock'){const p=Math.max(48*u,176*u*.5),tail=body.classList.contains('maclock-software-material')?clamp(((t-v.startedAt)/snap.params.duration-.75)/.25):0;if(!tail)holes.push({x:rect.x-p-30,y:rect.y-p-30,width:rect.width+2*p+60,height:rect.height+2*p+60});v.host.style.setProperty('--maclock-layer-opacity',1-quint(tail));v.host.style.filter=`blur(${values.morphBlur*48/3}px)`}
    for(let i=0;i<2;i++){
     const l=snap.layers[i],e=v.elements[i],a=values[i+'.opacity'],bl=values[i+'.blur'],fx=v.kind==='clock'?0:Math.min(1,bl/.35),candidate=v.kind==='clock'?v.tiles.get(l.text):null,tile=candidate?.canvas?candidate:null;
     e.box.style.cssText=`left:${values.align*(values.width-l.width)}px;width:${l.width}px;opacity:${a};transform:scale(${values[i+'.scale']}) scaleX(${values[i+'.sx']});`;
     if(e.content!==l.text||e.tile!==tile){e.content=l.text;e.tile=tile;e.crisp.replaceChildren();if(tile){const c=doc.createElement('canvas');c.width=tile.canvas.width;c.height=tile.canvas.height;c.getContext('2d').drawImage(tile.canvas,0,0);c.style.cssText=`position:absolute;left:${-tile.pad}px;top:${-tile.pad}px;width:${tile.width}px;height:${tile.height}px`;e.crisp.appendChild(c)}else e.crisp.textContent=l.text;e.soft.textContent=tile?'':l.text}
     e.crisp.style.opacity=1-fx;e.soft.style.opacity=fx;e.soft.style.filter=`blur(${snap.params.blurMax*bl/3}px)`;
    }
   }
   const surface=$('.maclock-material');if(surface){surface.style.clipPath=holes.length?'polygon(evenodd,0px 0px,100% 0px,100% 100%,0px 100%,0px 0px,'+holes.map(r=>`${r.x}px ${r.y}px,${r.x+r.width}px ${r.y}px,${r.x+r.width}px ${r.y+r.height}px,${r.x}px ${r.y+r.height}px,${r.x}px ${r.y}px,0px 0px`).join(',')+')':''}
  }
  function active(){return scalar.active()||shakeStart!==null||views.some(v=>v.visible&&v.model.active())}
  function queue(){if(disposed||doc.hidden||frame!==null||!active())return;const owner=generation;let ticket;ticket=win.requestAnimationFrame(()=>{if(disposed||owner!==generation||frame!==ticket)return;frame=null;paint();queue()});frame=ticket}
  function clear(){settle();paint()}
  const observer=new win.MutationObserver(sync);observer.observe(body,{attributes:true,attributeFilter:['class']});observer.observe(doc.documentElement,{attributes:true,attributeFilter:['class']});observer.observe(caps,{attributes:true,attributeFilter:['hidden']});observer.observe(errorNode,{attributes:true,attributeFilter:['hidden']});
  listen(doc,'air-maclock-clock-tile',tileReady);listen(doc,'air-login-rejected',rejected);listen(doc,'air-login-account-changed',clear);listen(doc,'air-login-confirmed',()=>{fieldWasActive=false;clear()});
  listen(doc,'air-maclock-material-state',e=>{if(e.detail?.status!=='webgl'&&e.detail?.status!=='loading')clear()});
  listen(media,'change',()=>{key='';sync()});listen(win,'resize',()=>{clear()});listen(doc,'visibilitychange',()=>{if(doc.hidden)clear()});
  listen(field,'pointerdown',e=>{if(e.button===0)fieldPress(true)});listen(win,'pointerup',()=>fieldPress(false));listen(win,'pointercancel',()=>fieldPress(false));listen(win,'blur',()=>fieldPress(false));
  listen(doc,'keydown',e=>{if(e.key==='Enter'&&!e.repeat&&e.target===$('#login-password'))fieldPress(true)});listen(doc,'keyup',e=>{if(e.key==='Enter')fieldPress(false)});
  function destroy(){if(disposed)return;settle();disposed=true;observer.disconnect();events.abort();for(const v of views){v.host.remove();v.node.classList.remove('maclock-morph-source');v.tiles.clear();for(const e of v.elements){e.box.replaceChildren();e.tile=null}}views.length=0;clockView=null;const surface=$('.maclock-material');if(surface)surface.style.clipPath='';if(fieldSprite){fieldSprite.width=fieldSprite.height=1;fieldSprite.remove()}fieldSprite=spriteSource=null;body.classList.remove('maclock-field-morph','maclock-morph-enabled','maclock-field-snapshot')}
  listen(win,'pagehide',destroy);
  doc.fonts.ready.then(setup);
  return Object.freeze({clock:clockText,destroy,snapshot:()=>({disposed,pendingFrame:frame!==null,active:active(),paints,paintTime,clockWaiting,scalar:scalar.sample(now()),views:views.map(v=>({kind:v.kind,visible:v.visible,startedAt:v.startedAt,...v.model.sample(now())}))})});
 }
 return Object.freeze({TEXT,CLOCK,SHAKE,quint,cubic,motion,textModel,mount});
});

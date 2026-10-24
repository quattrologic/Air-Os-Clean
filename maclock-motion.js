/* MacLock L1B.2 behavior port from LockScreen.qml, upstream
 * 1bdb51870b621100fd2709f66c8f8e00ab17b9c4, Copyright (c) 2026 Rickky, MIT.
 * See third_party/maclock/LICENSE. Exact OutQuint and QML targets/durations;
 * DOM/RAF lifecycle adaptation is Air-OS code. No authentication or secret access. */
(function(root,factory){
 'use strict';const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else {root.airMacLockMotion=api;root.airMacLockMotionController=api.mount(root);}
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const outQuint=t=>1-Math.pow(1-Math.max(0,Math.min(1,t)),5);
 const INITIAL=Object.freeze({opacity:0,zoom:1.09,clockPosition:.035,clockOpacity:0,loginBottom:30,loginOpacity:0,blur:0,blurOpacity:0,fieldWidth:210,avatarScale:.94});
 const ENTER=Object.freeze({opacity:1,zoom:1,clockPosition:.075,clockOpacity:1,loginBottom:78,loginOpacity:1});
 const EXIT=Object.freeze({opacity:0,zoom:1.06,clockPosition:.035,clockOpacity:0,loginBottom:30,loginOpacity:0});
 const EXIT_MS=Object.freeze({opacity:420,zoom:520,clockPosition:420,clockOpacity:300,loginBottom:380,loginOpacity:260});
 function timeline(initial=INITIAL){
  const values={...initial},tracks=new Map();
  function sample(now){for(const [key,t]of tracks){const p=Math.max(0,Math.min(1,(now-t.start)/t.duration));values[key]=t.from+(t.to-t.from)*outQuint(p);if(p===1){values[key]=t.to;tracks.delete(key)}}return{...values}}
  function target(patch,durations,now,instant=false){sample(now);for(const [key,to]of Object.entries(patch)){const duration=typeof durations==='number'?durations:durations[key];if(tracks.get(key)?.to===to&&!instant)continue;if(instant||!duration||Math.abs(values[key]-to)<1e-10){values[key]=to;tracks.delete(key)}else tracks.set(key,{from:values[key],to,start:now,duration})}return sample(now)}
  function finish(){for(const[key,t]of tracks)values[key]=t.to;tracks.clear();return{...values}}
  return{sample,target,finish,cancel:()=>tracks.clear(),active:()=>tracks.size>0,tracks:()=>Object.fromEntries([...tracks].map(([key,t])=>[key,{...t}]))};
 }
 function mount(win){
  const doc=win.document,body=doc.body,model=timeline(),events=new win.AbortController(),motionMedia=win.matchMedia('(prefers-reduced-motion: reduce)'),image=new win.Image();
  let disposed=false,ready=false,leaving=false,frame=null,generation=0,deadline=null,reason='loading',assetsReady=false,assetReason='',lastKey='',startedAt=null,paints=0,paintTime=null,painted={...INITIAL};
  const now=()=>win.performance.now(),listen=(target,type,fn)=>target.addEventListener(type,fn,{signal:events.signal});
  function reduced(){return motionMedia.matches||body.classList.contains('air-reduced-motion')||doc.documentElement.classList.contains('air-reduced-motion')}
  function paint(){
   if(disposed)return;const time=now(),s=model.sample(time),u=Math.max(.6,win.innerHeight/1200),style=body.style;
   for(const [key,value]of Object.entries({opacity:s.opacity,zoom:s.zoom,clockOffset:(s.clockPosition-.075)*win.innerHeight,clockAlpha:s.opacity*s.clockOpacity,loginOffset:(78-s.loginBottom)*u,loginAlpha:s.opacity*s.loginOpacity,blur:s.blur*48/3,blurAlpha:s.blurOpacity,fieldWidth:Math.max(win.innerWidth<=600?210:0,s.fieldWidth*u),avatar:s.avatarScale}))style.setProperty('--maclock-motion-'+key,String(value));
   body.classList.toggle('maclock-motion-running',model.active());painted={...s};paintTime=time;paints++;
   // Public visual scalars only. The material renderer samples the same state/DOM frame.
   doc.dispatchEvent(new win.Event('air-maclock-frame'));
  }
  function queue(force=false){if(disposed||doc.hidden||frame!==null||(!force&&!model.active()))return;const owner=generation;let ticket;ticket=win.requestAnimationFrame(()=>{if(disposed||owner!==generation||frame!==ticket)return;frame=null;paint();queue()});frame=ticket}
  function apply(patch,duration){model.target(patch,duration,now(),reduced());paint();queue()}
  function enter(){if(disposed)return;leaving=false;startedAt=now();apply(ENTER,650)}
  function leave(deferPaint=false){if(disposed||!ready||body.classList.contains('is-creating'))return;leaving=true;if(deferPaint){model.target(EXIT,EXIT_MS,now(),reduced());queue(true)}else apply(EXIT,EXIT_MS)}
  function focus(){if(!ready||leaving||disposed)return;const engaged=body.classList.contains('is-engaged');apply({blur:engaged?.55:0,blurOpacity:engaged?1:0,fieldWidth:engaged||body.classList.contains('has-password')?236:210,avatarScale:engaged?1:.94},{blur:650,blurOpacity:650,fieldWidth:450,avatarScale:650})}
  function assets(why){assetsReady=true;assetReason=why;const material=win.airMacLockGlassController?.snapshot().status;if(reduced()||body.classList.contains('is-creating')||!material||material!=='loading')start(why)}
  function start(why){
   if(disposed||ready)return;ready=true;reason=why;win.clearTimeout(deadline);deadline=null;
   body.classList.remove('maclock-motion-pending');body.classList.add('maclock-motion-ready');
   if(body.classList.contains('is-creating')){model.target(ENTER,0,now(),true);paint()}else enter();focus();
  }
  function classes(){
   const key=[body.classList.contains('is-creating'),body.classList.contains('is-engaged'),body.classList.contains('has-password'),reduced()].join('|');if(key===lastKey)return;const wasCreating=lastKey.split('|')[0]==='true';lastKey=key;
   if(!ready)return;
   if(body.classList.contains('is-creating')){leaving=false;model.finish();model.target({...ENTER,blur:0,blurOpacity:0,fieldWidth:210,avatarScale:.94},0,now(),true);paint()}
   else {if(wasCreating)enter();focus()}
   if(reduced()){model.finish();if(frame!==null)win.cancelAnimationFrame(frame);frame=null;generation++;paint()}
  }
  const observer=new win.MutationObserver(classes);observer.observe(body,{attributes:true,attributeFilter:['class']});observer.observe(doc.documentElement,{attributes:true,attributeFilter:['class']});
  listen(motionMedia,'change',()=>{lastKey='';classes()});
  listen(win,'resize',()=>{if(ready)paint()});
  listen(doc,'visibilitychange',()=>{if(doc.hidden){if(frame!==null)win.cancelAnimationFrame(frame);frame=null;generation++;model.finish();if(ready)paint()}else if(ready){paint();queue()}});
  listen(doc,'air-login-confirmed',()=>leave(true));
  listen(doc,'air-maclock-material-state',event=>{
   if(assetsReady&&!ready&&event.detail?.status!=='loading')start(assetReason);
   if(event.detail?.reason!=='context-lost'||disposed)return;
   // Retire the old RAF generation; retain current tracks/elapsed time for CSS fallback.
   if(frame!==null)win.cancelAnimationFrame(frame);frame=null;generation++;queue();
  });
  function destroy(){if(disposed)return;disposed=true;generation++;model.cancel();if(frame!==null)win.cancelAnimationFrame(frame);frame=null;win.clearTimeout(deadline);deadline=null;observer.disconnect();events.abort();image.onload=image.onerror=null;image.removeAttribute('src')}
  listen(win,'pagehide',destroy);
  deadline=win.setTimeout(()=>start('wallpaper-timeout-fallback'),450);
  image.src='maclock-wallpaper.svg';Promise.all([image.decode(),doc.fonts.ready]).then(()=>assets('wallpaper-ready')).catch(()=>start('wallpaper-error-fallback'));
  classes();
  return Object.freeze({enter,leave,destroy,snapshot:()=>({disposed,ready,reason,leaving,reducedMotion:reduced(),pendingFrame:frame!==null,deadlinePending:deadline!==null,startedAt,now:now(),paintTime,paints,active:model.active(),values:{...painted},tracks:model.tracks()})});
 }
 return Object.freeze({outQuint,timeline,INITIAL,ENTER,EXIT,EXIT_MS,mount});
});

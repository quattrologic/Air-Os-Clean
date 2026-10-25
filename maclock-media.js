/* Compact media port: MacLock/LockScreen.qml and Glyph.qml, revision
 * 1bdb51870b621100fd2709f66c8f8e00ab17b9c4. Copyright (c) 2026 Rickky, MIT.
 * See third_party/maclock/LICENSE and NOTICE.md. Public static DEMO only.
 * No audio owner, authenticated bridge, profile store or private metadata access. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else {root.airMacLockMedia=api;root.airMacLockMediaController=api.mount(root);}
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const demo=Object.freeze({title:'Wolkenlicht',artist:'Air-OS Studio',position:56,duration:200,label:'DEMO · keine Audiowiedergabe'});
 function layout(height,clockHeight,width){
  const u=Math.max(.6,height/1200);
  return{u,x:(width-372*u)/2,y:.075*height+clockHeight+22*u,width:372*u,height:150*u,radius:28*u,cover:58*u};
 }
 // Original scrub.fmt, with a finite-number guard at the public demo boundary.
 function fmt(s){s=Number.isFinite(s)?Math.max(0,Math.floor(s)):0;const m=Math.floor(s/60),r=s%60;return m+':'+(r<10?'0':'')+r;}
 // Original Glyph.qml rounded-polygon procedure and transport coordinates.
 // Only public geometric glyphs enter Canvas; never text or input values.
 function glyph(ctx,kind,ink='white'){
  function rpoly(p,r){
   const n=p.length/2;ctx.beginPath();ctx.moveTo((p[0]+p[2*(n-1)])/2,(p[1]+p[2*(n-1)+1])/2);
   for(let q=0;q<n;q++){const x=p[2*q],y=p[2*q+1],nx=p[2*((q+1)%n)],ny=p[2*((q+1)%n)+1];ctx.arcTo(x,y,(x+nx)/2,(y+ny)/2,r)}
   ctx.closePath();ctx.fill();
  }
  ctx.fillStyle=ink;
  if(kind==='play')rpoly([5,3.2,15,9,5,14.8],.8);
  else if(kind==='next'){rpoly([1.8,4,8.6,9,1.8,14],.6);rpoly([9.4,4,16.2,9,9.4,14],.6)}
  else if(kind==='prev'){rpoly([16.2,4,9.4,9,16.2,14],.6);rpoly([8.6,4,1.8,9,8.6,14],.6)}
 }
 function mount(win){
  const doc=win.document,card=doc.querySelector('#maclock-media'),clock=doc.querySelector('.maclock-clock');
  if(!card||!clock)return null;
  const events=new win.AbortController(),forced=win.matchMedia('(forced-colors: active)');let disposed=false,lastKey='',updates=0,current=null;
  for(const [id,text]of [['maclock-media-demo',demo.label],['maclock-media-title',demo.title],['maclock-media-artist',demo.artist],['maclock-media-elapsed',fmt(demo.position)],['maclock-media-remaining','-'+fmt(demo.duration-demo.position)]])doc.querySelector('#'+id).textContent=text;
  function position(){
   if(disposed)return;
   const next=layout(win.innerHeight,clock.getBoundingClientRect().height,win.innerWidth),key=JSON.stringify([next,win.devicePixelRatio||1,forced.matches]);
   if(key===lastKey)return;lastKey=key;current=next;updates++;
   card.style.left=next.x+'px';card.style.top=next.y+'px';
   for(const canvas of card.querySelectorAll('canvas')){
    const size=(canvas.dataset.glyph==='play'?26:22)*next.u,dpr=Math.min(2,win.devicePixelRatio||1);
    canvas.width=canvas.height=Math.ceil(size*dpr);const ctx=canvas.getContext('2d');if(!ctx)continue;
    ctx.scale(canvas.width/18,canvas.height/18);glyph(ctx,canvas.dataset.glyph,win.getComputedStyle(canvas).color);
   }
   doc.dispatchEvent(new win.Event('air-maclock-media-layout'));
  }
  const observer=new win.ResizeObserver(position);observer.observe(clock);
  win.addEventListener('resize',position,{signal:events.signal});
  forced.addEventListener('change',position,{signal:events.signal});
  function destroy(){if(disposed)return;disposed=true;observer.disconnect();events.abort();card.hidden=true;for(const canvas of card.querySelectorAll('canvas'))canvas.width=canvas.height=0;}
  win.addEventListener('pagehide',destroy,{signal:events.signal});
  position();doc.fonts.ready.then(position,()=>{});
  return Object.freeze({destroy,snapshot:()=>({disposed,updates,layout:current,publicDemo:true})});
 }
 return Object.freeze({demo,layout,fmt,glyph,mount});
});

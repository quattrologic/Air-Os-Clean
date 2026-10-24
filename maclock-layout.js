/* MacLock layout/clock port from 0-ss/MacShell, revision
 * 1bdb51870b621100fd2709f66c8f8e00ab17b9c4, MacLock/LockScreen.qml.
 * Copyright (c) 2026 Rickky. MIT; see third_party/maclock/LICENSE.
 * Qt-independent formulas are retained; DOM/CSS and Intl replace QML/Qt. */
(function(root,factory){
 'use strict';
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.airMacLockLayout=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function layout(height,engaged=false){
  const u=Math.max(0.6,height/1200);
  return {u,clockTop:0.075*height,clockPx:176*u,datePx:25*u,
   clockLetterSpacing:-1.5*u,clockGap:-14*u,loginBottom:78*u,
   avatar:70*u,avatarScale:engaged?1:0.94,namePx:15*u,spacing:10*u,
   passwordWidth:(engaged?236:210)*u,passwordHeight:36*u,
   passwordPx:14*u,hintPx:12*u};
 }
 // LockScreen.qml: H:mm / (hours % 12 || 12) + :mm; no AM/PM suffix.
 function time(now,use24h=true){
  const hour=use24h?now.getHours():((now.getHours()%12)||12);
  return hour+':'+String(now.getMinutes()).padStart(2,'0');
 }
 // Preserve the original long-date pattern: dddd, MMMM d, with localized names.
 function date(now,locale){
  const parts=new Intl.DateTimeFormat(locale,{weekday:'long',month:'long',day:'numeric'}).formatToParts(now);
  const get=kind=>parts.find(p=>p.type===kind)?.value||'';
  return get('weekday')+', '+get('month')+' '+get('day');
 }
 return Object.freeze({layout,time,date});
});

'use strict';
// MacBar.qml swTrack/swBuild ordering, adapted to authoritative Air-OS app IDs.
// MIT Copyright (c) 2026 Rickky; third_party/deep-port/LICENSE.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airWindowMath=api;})(typeof window==='object'?window:null,function(){
 function track(mru,id){return [id,...mru.filter(n=>n!==id)].slice(0,60);}
 function order(ids,mru,active){return [...new Set([active,...mru,...ids])].filter(id=>ids.includes(id));}
 function bounds(b,width,height){const w=Math.min(width,Math.max(Math.min(320,width),b.width)),h=Math.min(height,Math.max(Math.min(220,height),b.height));return {left:Math.max(0,Math.min(width-w,b.left)),top:Math.max(0,Math.min(height-h,b.top)),width:w,height:h};}
 return Object.freeze({track,order,bounds});
});

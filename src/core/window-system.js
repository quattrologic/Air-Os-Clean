'use strict';
// MacBar.qml swTrack/swBuild ordering, adapted to authoritative Air-OS app IDs.
// MIT Copyright (c) 2026 Rickky; third_party/deep-port/LICENSE.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airWindowMath=api;})(typeof window==='object'?window:null,function(){
 function track(mru,id){return [id,...mru.filter(n=>n!==id)].slice(0,60);}
 function order(ids,mru,active){return [...new Set([active,...mru,...ids])].filter(id=>ids.includes(id));}
 function bounds(b,width,height){const w=Math.min(width,Math.max(Math.min(320,width),b.width)),h=Math.min(height,Math.max(Math.min(220,height),b.height));return {left:Math.max(0,Math.min(width-w,b.left)),top:Math.max(0,Math.min(height-h,b.top)),width:w,height:h};}
 function workArea(width,height,fullscreen=false){const top=fullscreen?0:24;return {left:0,top,width:Math.max(0,width),height:Math.max(0,height-top)};}
 function restoreBounds(b,width,height){const fitted=bounds(b,width,height);if(b.left<0||b.top<0||b.left+b.width>width||b.top+b.height>height){fitted.left=Math.max(0,(width-fitted.width)/2);fitted.top=Math.max(0,(height-fitted.height)/2);}return fitted;}
 return Object.freeze({track,order,bounds,workArea,restoreBounds});
});

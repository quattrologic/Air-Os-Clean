/* MacShell MacDock.qml cosine influence / ClockWidget.qml material geometry.
 * MIT Copyright (c) 2026 Rickky. Pinned sources/NOTICE: third_party/tahoe6/.
 * Air-OS adapts icon-only scale to fixed cells instead of resizing the Dock. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airTahoe6Math=api;})(typeof window==='object'?window:null,function(){
 function influence(distance,iconSize,spacing=6){const R=(iconSize+spacing)*2.6,d=Math.abs(distance);return d<R?.5*(1+Math.cos(Math.PI*d/R)):0;}
 function scale(distance,iconSize,cellWidth,strength=1){if(!Number.isFinite(distance)||!Number.isFinite(iconSize)||iconSize<=0)return 1;const peak=Math.max(1,Math.min(1.7,cellWidth/iconSize));return 1+(peak-1)*influence(distance,iconSize)*Math.max(0,Math.min(1,strength));}
 function clockMaterial(width,height,size='small'){const u=Math.min(width,height)/158;return {unit:u,radius:28*(size==='small'?168/158:size==='medium'?358/338:1),timeFont:64*u,dateFont:11.5*u,tint:Math.min(.92,.25+.42*.8)};}
 return Object.freeze({influence,scale,clockMaterial,menuOrder:['app','file','edit','view','window','help']});
});

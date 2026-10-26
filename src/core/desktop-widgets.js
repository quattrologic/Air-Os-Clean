'use strict';
// MacWidgets.qml dims/gridInfo/overlaps/nearestFreeSlot and ClockWidget.qml tickGeo.
// MIT Copyright (c) 2026 Rickky, pinned 1bdb518; see third_party/deep-port/LICENSE.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airWidgetMath=api;})(typeof window==='object'?window:null,function(){
 const ids=Object.freeze(['clock','calendar','notes','reminders','music','image','weather']);
 const labels=Object.freeze({clock:'Heute',calendar:'Kalender',notes:'Notizen',reminders:'Erinnerungen',music:'Now Playing',image:'Bild',weather:'Wetter'});
 function dims(size,width=1920){const b=size==='large'?[375,385]:size==='medium'?[395,185]:[185,185],s=Math.min(1,Math.max(1,width-42)/b[0]);return {width:Math.round(b[0]*s),height:Math.round(b[1]*s)};}
 function gridInfo(width,height){const availW=width-42,availH=height-56-24,cols=Math.max(1,Math.floor((availW+28)/(179+28))),rows=Math.max(1,Math.floor((availH+23)/(179+23))),used=cols*179+(cols-1)*28;return {cols,rows,left:21+Math.floor(Math.max(0,availW-used)/2),top:56,pitchX:207,pitchY:202};}
 const overlaps=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
 function slots(box,others,width,height){const g=gridInfo(width,height-54),out=[];for(let row=0;row<g.rows;row++)for(let col=0;col<g.cols;col++){const b={x:g.left+col*g.pitchX,y:g.top+row*g.pitchY,...box};if(b.x+box.width<=width-21&&b.y+box.height<=height-78&&!others.some(o=>overlaps(b,o)))out.push(b);}return out;}
 function nearest(box,others,width,height,x,y){let best=null,distance=Infinity;for(const p of slots(box,others,width,height)){const d=(p.x-x)**2+(p.y-y)**2;if(d<distance){best=p;distance=d;}}return best;}
 function firstLeft(box,others,width,height){return slots(box,others,width,height).sort((a,b)=>a.x-b.x||a.y-b.y)[0]||null;}
 function pages(entries,height){const result=[[]];let used=0;for(const item of entries){const h=Math.min(item.height,height-190);if(used&&used+h+12>height-172){result.push([]);used=0;}result.at(-1).push({...item,height:h,y:96+used});used+=h+12;}return result;}
 function ticks(W,H,radius=28){const u=Math.min(W,H)/158,inset=9*u,L=5.6*u,hw=W/2-inset,hh=H/2-inset,cr=Math.max(4*u,radius-inset),cx=hw-cr,cy=hh-cr;return Array.from({length:60},(_,i)=>{const th=i*Math.PI/30,dx=Math.sin(th),dy=-Math.cos(th),ax=Math.abs(dx),ay=Math.abs(dy);let t=Math.min(ax>1e-9?hw/ax:1e9,ay>1e-9?hh/ay:1e9),px=ax*t,py=ay*t;if(px>cx&&py>cy){const b=ax*cx+ay*cy,c=cx*cx+cy*cy-cr*cr;t=b+Math.sqrt(Math.max(0,b*b-c));px=ax*t;py=ay*t;}return {x:W/2+(dx<0?-px:px)-dx*L/2,y:H/2+(dy<0?-py:py)-dy*L/2,angle:Math.atan2(dx,-dy)*180/Math.PI,length:L};});}
 return Object.freeze({ids,labels,dims,gridInfo,overlaps,nearest,firstLeft,pages,ticks});
});

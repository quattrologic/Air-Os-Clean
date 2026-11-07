'use strict';
// Pure bounded presentation math; no app registry, database, playback or timer state.
(function(root,factory){const api=factory(typeof module==='object'?require('./motion-data.js'):root.airProNotchMotionData);if(typeof module==='object')module.exports=api;else root.airProNotchModel=api;})(typeof window==='object'?window:null,data=>{
 const modes=Object.keys(data.sizes);
 function geometry(mode,width,height,compact=false){const key=mode==='closed'&&compact?'compact':modes.includes(mode)?mode:'closed';const [w,h,r]=data.sizes[key];return{width:Math.max(180,Math.min(w,Math.max(180,width-24))),height:Math.max(28,Math.min(h,Math.max(28,height-64))),radius:r,key};}
 function frames(from,to,kind){const profile=data.profiles[kind]||data.profiles.switch;return profile.samples.map(([offset,p,wp=p])=>({offset,width:(from.width+(to.width-from.width)*wp)+'px',height:(from.height+(to.height-from.height)*p)+'px',borderBottomLeftRadius:Math.max(0,from.radius+(to.radius-from.radius)*p)+'px',borderBottomRightRadius:Math.max(0,from.radius+(to.radius-from.radius)*p)+'px'}));}
 function lrc(text){if(typeof text!=='string'||text.length>100000)return[];const cues=[];for(const line of text.split(/\r?\n/).slice(0,1500)){const content=line.replace(/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/g,'').trim().slice(0,400);if(!content)continue;for(const m of line.matchAll(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g)){if(Number(m[2])>=60)continue;cues.push({at:Number(m[1])*60+Number(m[2])+(m[3]?Number('0.'+m[3]):0),text:content});if(cues.length>=1000)break;}if(cues.length>=1000)break;}return cues.sort((a,b)=>a.at-b.at);}
 const stem=name=>String(name||'').normalize('NFC').trim().replace(/\.(lrc|mp3|m4a|wav|ogg|aac|flac)$/i,'').trim().toLocaleLowerCase();
 return Object.freeze({data,geometry,frames,lrc,stem,modes});
});

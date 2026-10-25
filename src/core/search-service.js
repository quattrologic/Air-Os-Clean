'use strict';
// Spotlight search over the explicitly registered built-in Air-OS applications.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.airSearchService=api;
})(typeof window!=='undefined'?window:null,function(){
 const normalize=value=>String(value||'').trim().toLocaleLowerCase('de-DE');
 function findApps(registry,input,limit=24){
  if(!registry||typeof registry.list!=='function')throw new TypeError('App Registry fehlt.');
  if(!Number.isInteger(limit)||limit<1||limit>100)throw new TypeError('Ungültiges Limit.');
  const needle=normalize(input);
  const matches=registry.list().filter(app=>!needle||normalize(app.name).includes(needle)||normalize(app.id).includes(needle));
  matches.sort((a,b)=>{
   const aName=normalize(a.name),bName=normalize(b.name);
   const rank=name=>!needle?0:name===needle?0:name.startsWith(needle)?1:2;
   return rank(aName)-rank(bName)||aName.localeCompare(bName,'de-DE');
  });
  return Object.freeze(matches.slice(0,limit).map(app=>Object.freeze({id:app.id,name:app.name,iconClass:app.iconClass})));
 }
 function findNotes(entries,input,limit=12){
  if(!Array.isArray(entries))throw new TypeError('Ungültige Notizen.');
  if(!Number.isInteger(limit)||limit<1||limit>50)throw new TypeError('Ungültiges Limit.');
  const needle=normalize(input);
  if(needle.length<2)return Object.freeze([]);
  return Object.freeze(entries.filter(entry=>entry&&typeof entry.id==='string'&&typeof entry.title==='string'&&normalize(entry.title).includes(needle))
   .slice(0,limit).map(entry=>Object.freeze({id:entry.id,title:entry.title||'Ohne Titel',type:'note'})));
 }
 // MacBar.qml searchApps score ladder, MIT Copyright (c) 2026 Rickky.
 function rankApps(registry,input,limit=24){
  const q=normalize(input);if(!q)return findApps(registry,input,limit);
  return Object.freeze(registry.list().map(e=>{const n=normalize(e.name);let score=n===q?100:n.startsWith(q)?80:n.includes(' '+q)?60:n.includes(q)?40:normalize(e.id).includes(q)?25:0;return {e,score};}).filter(h=>h.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(h=>Object.freeze({id:h.e.id,name:h.e.name,iconClass:h.e.iconClass})));
 }
 return Object.freeze({findApps,findNotes,rankApps});
});

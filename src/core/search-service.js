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
 return Object.freeze({findApps});
});

'use strict';
// Existing browser-local formats, with explicit account ownership; legacy unowned keys are never guessed or deleted.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airProfileLocal=api;})(typeof window==='object'?window:null,function(){
 async function open({api,storage,base,empty,events}){
  const owner=await api.currentUser();if(!owner?.username||!owner.preferenceSession)throw Error('Anmeldung erforderlich.');
  if((await api.currentUser())?.preferenceSession!==owner.preferenceSession)throw Error('Sitzung geändert.');
  const key=base+':profile:'+encodeURIComponent(owner.username.toLocaleLowerCase('en-US'));let active=true;
  const end=()=>{active=false;};events?.addEventListener('air-profile-changing',end,{once:true});
  const valid=()=>{if(!active)throw Error('Sitzung beendet.');};
  return {read(){valid();const raw=storage.getItem(key);return raw===null?JSON.parse(JSON.stringify(empty)):JSON.parse(raw);},write(value){valid();storage.setItem(key,JSON.stringify(value));},legacy:storage.getItem(base)!==null,dispose(){active=false;events?.removeEventListener('air-profile-changing',end);}};
 }
 return Object.freeze({open});
});

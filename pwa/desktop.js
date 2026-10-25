'use strict';
(() => {
 const supported=new Set(['home','notes','settings','calculator','about','launchpad']);const original=window.openApp;
 window.openApp=function(id,...args){if(!supported.has(id)){toast('PWA-1: '+(airAppRegistry.get(id)?.name||id)+' ist hier nicht unterstützt.');return {ok:false,error:'PWA_UNSUPPORTED'};}return original(id,...args);};
 const banner=document.createElement('p');banner.className='pwa-local-label';banner.textContent='Lokal · Cloud aus';document.body.append(banner);
 document.documentElement.dataset.pwa='true';
 const mark=()=>document.querySelectorAll('button[data-app]').forEach(b=>{if(!supported.has(b.dataset.app)){b.disabled=true;b.setAttribute('aria-disabled','true');b.title='PWA-1: nicht verfügbar';}});mark();new MutationObserver(mark).observe(document.querySelector('.windows')||document.body,{childList:true,subtree:true});

})();

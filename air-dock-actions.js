'use strict';
// MacDock/SPopUp action semantics and 320ms OutQuint entry, adapted to Air-OS lifecycle.
(() => {
 let menu=null,owner=null;const events=new AbortController();
 function close(focus=false){menu?.remove();menu=null;if(focus&&owner?.isConnected)owner.focus();}
 function open(target){close();owner=target;const id=target.dataset.app,entry=airAppRegistry.get(id);if(!entry)return;const win=openApps.get(id);menu=document.createElement('section');menu.className='deep-dock-menu';menu.setAttribute('role','dialog');menu.setAttribute('aria-label',entry.name+' Fensteraktionen');const name=document.createElement('strong');name.textContent=entry.name;menu.append(name);
  for(const [text,action,enabled]of [['Öffnen / Fenster fokussieren',()=>openApp(id),true],['Minimieren',()=>win?.querySelector('.minimize')?.click(),!!win],['Fenster schließen',()=>win?.querySelector('.close')?.click(),!!win]]){const b=document.createElement('button');b.type='button';b.textContent=text;b.disabled=!enabled;b.onclick=()=>{close();action();};menu.append(b);}
  document.body.append(menu);const r=target.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(innerWidth-228,r.x+r.width/2-110))+'px';menu.style.bottom=(innerHeight-document.querySelector('.dock').getBoundingClientRect().top+8)+'px';menu.querySelector('button').focus();
 }
 document.querySelector('.dock')?.addEventListener('contextmenu',e=>{if(document.documentElement.dataset.desktopTheme!=='modern')return;const target=e.target.closest('button[data-app]');if(!target)return;e.preventDefault();open(target);},{signal:events.signal});
 document.addEventListener('pointerdown',e=>{if(menu&&!menu.contains(e.target))close();},{signal:events.signal});document.addEventListener('keydown',e=>{if(menu&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close(true);}},{capture:true,signal:events.signal});
 document.addEventListener('air-settings-changed',()=>close(),{signal:events.signal});window.addEventListener('resize',()=>close(),{signal:events.signal});const end=()=>{close();events.abort();};document.addEventListener('air-profile-changing',end,{once:true});window.addEventListener('pagehide',end,{once:true});
})();

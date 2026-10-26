'use strict';
// MacDock/SPopUp action semantics. Existing registry, pin contract and lifecycle remain authoritative.
(() => {
 let menu=null,owner=null;const events=new AbortController(),signal=events.signal;
 const modern=()=>document.documentElement.dataset.desktopTheme==='modern';
 function close(focus=false){menu?.remove();menu=null;if(focus&&owner?.isConnected)owner.focus();}
 function button(text,action,enabled=true){const b=document.createElement('button');b.type='button';b.textContent=text;b.disabled=!enabled;b.onclick=()=>{close();action();};return b;}
 function anchor(target){document.body.append(menu);const r=target.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(innerWidth-menu.offsetWidth-8,r.x+r.width/2-menu.offsetWidth/2))+'px';menu.style.bottom=(innerHeight-document.querySelector('.dock').getBoundingClientRect().top+8)+'px';menu.querySelector('button')?.focus();}
 function overview(target){close();owner=target;menu=document.createElement('section');menu.className='deep-dock-menu tahoe4-window-overview';menu.setAttribute('role','dialog');menu.setAttribute('aria-label','Geöffnete Air-OS-Fenster');const title=document.createElement('h2');title.textContent='Geöffnete Fenster';menu.append(title,button('Schließen',()=>target.focus()));let count=0;
  for(const [id,win]of openApps){const app=airAppRegistry.get(id);if(!app||!win.isConnected)continue;count++;const row=document.createElement('div'),art=document.createElement('span'),name=document.createElement('strong'),state=document.createElement('small');row.className='tahoe4-window-row';art.className='tahoe4-window-icon';paintAirAppIcon(art,id);name.textContent=app.name;const minimized=airAppLifecycle.get(id)==='minimized';state.textContent=minimized?'Minimiert':'Geöffnet';row.append(art,name,state,button('Fokussieren',()=>openApp(id)),button('Schließen',()=>win.querySelector('.close')?.click()));menu.append(row);}
  if(!count){const p=document.createElement('p');p.textContent='Keine geöffneten Fenster.';menu.append(p);}anchor(target);
 }
 function open(target){close();owner=target;const id=target.dataset.app,entry=airAppRegistry.get(id);if(!entry)return;const win=openApps.get(id);menu=document.createElement('section');menu.className='deep-dock-menu';menu.setAttribute('role','dialog');menu.setAttribute('aria-label',entry.name+' Fensteraktionen');const name=document.createElement('strong');name.textContent=entry.name;menu.append(name);
  for(const [text,fn,enabled]of [['Öffnen / Fenster fokussieren',()=>openApp(id),true],['Minimieren',()=>win?.querySelector('.minimize')?.click(),!!win],['Fenster schließen',()=>win?.querySelector('.close')?.click(),!!win]])menu.append(button(text,fn,enabled));
  menu.append(button('Fensterübersicht',()=>overview(target)));
  if(id!=='launchpad'){const pinned=airDockReferences(readAirSettings().dockPins).includes(id);menu.append(button(pinned?'Vom Dock lösen':'Im Dock behalten',async()=>{try{await persistAirDockPin(id,!pinned);}catch{toast('Dock-Pin konnte nicht gespeichert werden. Bitte erneut versuchen.');}},!!window.airOS?.preferences));}anchor(target);
 }
 function states(){document.querySelectorAll('.dock-app[data-app]').forEach(b=>{if(!modern()){b.removeAttribute('data-window-state');return;}b.dataset.windowState=airAppLifecycle.get(b.dataset.app);});}
 const stop=airAppLifecycle.onChange(()=>{states();if(menu?.classList.contains('tahoe4-window-overview'))close();});
 const observer=new MutationObserver(states);observer.observe(document.querySelector('.dock'),{childList:true});states();
 document.querySelector('.dock')?.addEventListener('contextmenu',e=>{if(!modern())return;const target=e.target.closest('button[data-app]');if(!target)return;e.preventDefault();open(target);},{signal});
 document.querySelector('.dock')?.addEventListener('keydown',e=>{if(modern()&&e.shiftKey&&e.key==='F10'){const target=e.target.closest('button[data-app]');if(target){e.preventDefault();open(target);}}},{signal});
 document.addEventListener('pointerdown',e=>{if(menu&&!menu.contains(e.target))close();},{signal});document.addEventListener('keydown',e=>{if(!menu)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close(true);}else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){const buttons=[...menu.querySelectorAll('button:not(:disabled)')],i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowDown'?1:buttons.length-1))%buttons.length]?.focus();}},{capture:true,signal});
 document.addEventListener('air-settings-changed',()=>{close();states();},{signal});window.addEventListener('resize',()=>close(),{signal});const end=()=>{close();stop();observer.disconnect();events.abort();};document.addEventListener('air-profile-changing',end,{once:true});window.addEventListener('pagehide',end,{once:true});
})();

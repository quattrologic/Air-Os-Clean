'use strict';
// Shared presentation/accessibility adapters. Existing app controllers own data and actions.
(() => {
 const mounted=new Map(),dialogs=new Set(),host=document.querySelector('#windows');if(!host)return;
 const modern=()=>document.documentElement.dataset.desktopTheme==='modern';
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};
 const button=(text,action,label=text)=>{const b=el('button','',text);b.type='button';b.setAttribute('aria-label',label);b.onclick=action;return b;};
 function paintFiles(win){win.querySelectorAll('.air-file-entry').forEach(b=>{const art=b.querySelector('.air-file-icon');if(!art)return;if(!modern()){if(art.dataset.classicGlyph!==undefined)art.textContent=art.dataset.classicGlyph;return;}const key=b.dataset.kind==='folder'?'folder':/\.(png|jpe?g|webp|gif)$/i.test(b.dataset.path)?'pictures':/\.(mp3|wav|flac|ogg|m4a)$/i.test(b.dataset.path)?'music':/\.(txt|md|json|css|js|html|csv)$/i.test(b.dataset.path)?'notes':null;if(key&&!art.querySelector('img')){if(art.dataset.classicGlyph===undefined)art.dataset.classicGlyph=art.textContent;const image=el('img','air-tahoe-icon');image.src=airTahoeIcons[key];image.alt='';art.replaceChildren(image);}});}
 function mount(win){if(mounted.has(win))return;const root=win.querySelector('.air-files-app,.air-notes,.air-reminders,.air-calendar-app,.airmusic');if(!root)return;
  const events=new AbortController(),signal=events.signal;let menu=null,opener=null;
  root.classList.add('tahoe-app');
  const sidebar=root.querySelector('.air-files-sidebar,.note-list,.arem-sidebar,.airmusic-sidebar');sidebar?.classList.add('tahoe-sidebar');
  root.querySelectorAll('.air-files-toolbar,.airmusic-header,.air-reminders>header,.air-calendar-app>header').forEach(n=>n.classList.add('tahoe-app-toolbar'));
  // Arrow navigation supplements native Tab/Enter/Space, without changing selection ownership.
  root.addEventListener('keydown',e=>{if(!modern()||!['ArrowUp','ArrowDown','Home','End'].includes(e.key)||!e.target.matches('.air-file-entry,.air-note-item,.arem-item'))return;const list=e.target.closest('#air-files-entries,#air-note-list,.arem-list'),items=[...list.querySelectorAll('.air-file-entry,.air-note-item,.arem-item')].filter(n=>n.getClientRects().length);let i=items.indexOf(e.target);i=e.key==='Home'?0:e.key==='End'?items.length-1:Math.max(0,Math.min(items.length-1,i+(e.key==='ArrowDown'?1:-1)));e.preventDefault();items[i]?.focus();},{signal});
  function closeMenu(focus=false){menu?.remove();menu=null;if(focus&&opener?.isConnected)opener.focus();}
  if(root.matches('.air-files-app')){
   paintFiles(win);root.querySelector('.air-files-place>span')?.setAttribute('data-art','folder');paintAppIcons(root);
   root.addEventListener('contextmenu',e=>{if(!modern())return;const entry=e.target.closest('.air-file-entry');if(!entry)return;e.preventDefault();closeMenu();opener=entry;menu=el('div','tahoe-context-menu');menu.setAttribute('role','menu');menu.setAttribute('aria-label','Dateiaktionen');
    const row=entry.closest('.air-file-row');for(const [label,target]of [['Öffnen',entry],['Umbenennen',row.querySelector('[data-air-action=rename-item]')],['Duplizieren',row.querySelector('[data-air-action=duplicate-item]')]]){if(!target)continue;const b=button(label,()=>{closeMenu();target.click();});b.setAttribute('role','menuitem');menu.append(b);}
    document.body.append(menu);const r=menu.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(innerWidth-r.width-8,e.clientX))+'px';menu.style.top=Math.max(8,Math.min(innerHeight-r.height-8,e.clientY))+'px';menu.firstElementChild.focus();},{signal});
   document.addEventListener('pointerdown',e=>{if(menu&&!menu.contains(e.target))closeMenu();},{signal});
   document.addEventListener('keydown',e=>{if(!menu)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeMenu(true);}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const buttons=[...menu.querySelectorAll('button')],i=buttons.indexOf(document.activeElement);buttons[(i+(e.key==='ArrowDown'?1:buttons.length-1))%buttons.length].focus();}else if(e.key==='Tab')closeMenu();},{signal,capture:true});
  }
  let calendarPaint=()=>{};
  if(root.matches('.air-calendar-app')){
   const now=new Date(),board=el('aside','tahoe-calendar-board'),nav=el('div','tahoe-calendar-nav'),title=el('strong'),grid=el('div','tahoe-calendar-grid'),status=el('p','tahoe-calendar-selection');let year=now.getFullYear(),month=now.getMonth(),selected=null;
   const prev=button('‹',()=>shift(-1),'Vorheriger Monat'),next=button('›',()=>shift(1),'Nächster Monat'),all=button('Alle Termine',()=>{selected=null;paint();}),today=button('Heute',()=>{year=now.getFullYear();month=now.getMonth();selected=airTahoeAppModel.day(new Date());paint();});
   nav.append(prev,title,next);title.setAttribute('aria-live','polite');board.append(nav,today,all,grid,status);root.querySelector('header').after(board);
   function shift(delta){const d=new Date(year,month+delta,1,12);year=d.getFullYear();month=d.getMonth();paint();}
   function paint(){board.hidden=!modern();title.textContent=new Date(year,month,1,12).toLocaleDateString('de-DE',{month:'long',year:'numeric'});grid.replaceChildren();for(const name of ['Mo','Di','Mi','Do','Fr','Sa','So'])grid.append(el('span','',name));for(const d of airTahoeAppModel.calendar(year,month)){const b=button(String(d.n),()=>{selected=d.date;root.querySelector('#air-calendar-date').value=d.date;paint();},new Date(d.date+'T12:00:00').toLocaleDateString('de-DE',{dateStyle:'full'}));if(!d.current)b.className='outside';b.dataset.day=d.date;b.setAttribute('aria-pressed',String(selected===d.date));if(d.date===airTahoeAppModel.day(new Date()))b.setAttribute('aria-current','date');grid.append(b);}let count=0;root.querySelectorAll('.air-calendar-event').forEach(row=>{row.hidden=modern()&&!!selected&&row.dataset.eventDate!==selected;if(!row.hidden)count++;});status.textContent=selected?(count+' Termine am '+new Date(selected+'T12:00:00').toLocaleDateString('de-DE')):'Alle vorhandenen Termine';}
   win.addEventListener('air-calendar-rendered',paint,{signal});calendarPaint=paint;paint();
  }
  function sync(){if(!modern()){closeMenu();root.querySelectorAll('.tahoe-note-search,.tahoe-reminder-search').forEach(n=>{n.value='';n.dispatchEvent(new Event('input'));});const f=root.querySelector('.tahoe-reminder-filter');if(f){f.value='all';f.dispatchEvent(new Event('change'));}}paintFiles(win);calendarPaint();}
  document.addEventListener('air-settings-changed',sync,{signal});
  mounted.set(win,()=>{closeMenu();events.abort();});
 }
 function scan(){for(const [win,dispose]of mounted)if(!win.isConnected){dispose();mounted.delete(win);}host.querySelectorAll('.app-window').forEach(mount);}
 const observer=new MutationObserver(scan);observer.observe(host,{childList:true,subtree:true});scan();
 function prompt(title,value=''){return new Promise(resolve=>{const dialog=el('dialog','tahoe-dialog'),form=el('form'),heading=el('h2','',title),input=el('input'),actions=el('div','tahoe-dialog-actions');input.value=value;input.maxLength=120;input.required=true;input.setAttribute('aria-label',title);const cancel=button('Abbrechen',()=>dialog.close()),submit=el('button','','Bestätigen');submit.type='submit';actions.append(cancel,submit);form.append(heading,input,actions);dialog.append(form);document.body.append(dialog);dialogs.add(dialog);let result=null;form.onsubmit=e=>{e.preventDefault();if(!input.value.trim())return;result=input.value;dialog.close();};dialog.addEventListener('close',()=>{dialogs.delete(dialog);dialog.remove();resolve(result);},{once:true});dialog.showModal();input.focus();input.select();});}
 const dispose=()=>{observer.disconnect();for(const d of dialogs)d.close();for(const stop of mounted.values())stop();mounted.clear();};document.addEventListener('air-profile-changing',dispose,{once:true});window.addEventListener('pagehide',dispose,{once:true});
 window.airTahoeApps={paintFiles,prompt};
})();

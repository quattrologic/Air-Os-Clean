'use strict';
// Air Reminders: local tasks belonging to the currently authenticated profile.
(() => {
 const registry=window.airAppRegistry;
 if(!registry)return;
 if(!registry.get?.('reminders'))registry.register('reminders',{name:'Air Erinnerungen',iconClass:'reminders-icon',glyph:'✓'});
 const icon='<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="arblue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d8effe"/><stop offset="1" stop-color="#aacff5"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="14" fill="url(#arblue)"/><rect x="12" y="11" width="40" height="43" rx="9" fill="#fafdff" stroke="#bddbf3"/><path d="m19 22 3 3 5-6m-8 16 3 3 5-6m-8 16 3 3 5-6" stroke="#268add" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 23h11M33 36h11M33 48h11" stroke="#a6c6e2" stroke-width="2.5" stroke-linecap="round"/></svg>';
 if(typeof vectorIcon!=='undefined')vectorIcon.reminders=icon;
 function body(){return '<section class="air-reminders"><header><div><small>AIR-OS · PRODUKTIVITÄT</small><h2>Erinnerungen</h2><p>Deine Aufgaben. Offline und nur in deinem Air-OS-Profil.</p></div><button type="button" class="arem-new">＋ Neu</button></header><div class="arem-layout"><aside class="arem-sidebar"><h3>AUFGABEN</h3><div class="arem-list"></div><p class="arem-count"></p></aside><form class="arem-editor"><label>Titel<input class="arem-title" maxlength="140" required placeholder="Was steht an?"></label><label>Beschreibung<textarea class="arem-details" maxlength="2000" rows="5" placeholder="Notizen zur Aufgabe (optional)"></textarea></label><div class="arem-options"><label>Fällig am<input class="arem-date" type="date"></label><label>Priorität<select class="arem-priority"><option value="none">Keine</option><option value="low">Niedrig</option><option value="medium">Mittel</option><option value="high">Hoch</option></select></label></div><label class="arem-complete"><input type="checkbox" class="arem-done"> Erledigt</label><div class="arem-footer"><span class="arem-status" role="status" aria-live="polite">Lokal gespeichert</span><button class="arem-delete" type="button" disabled>Löschen</button><button class="arem-save" type="submit">Speichern</button></div></form></div></section>'}
 function mount(win){
  const root=win.querySelector('.air-reminders');if(!root||root.dataset.mounted)return;root.dataset.mounted='1';
  const api=window.airOS?.reminders,q=s=>root.querySelector(s),list=q('.arem-list'),form=q('.arem-editor');
  const title=q('.arem-title'),details=q('.arem-details'),date=q('.arem-date'),priority=q('.arem-priority'),done=q('.arem-done');
  const save=q('.arem-save'),del=q('.arem-delete'),status=q('.arem-status'),count=q('.arem-count');

  // Content-free confirmation belongs to this mounted app and its original login session.
  const owner=Promise.resolve(window.airOS?.currentUser?.()).then(user=>user?.preferenceSession).catch(()=>null);
  let notifyActive=true;
  const closeButton=win.querySelector('.close');
  function stopNotifications(){
   notifyActive=false;document.removeEventListener('air-profile-changing',stopNotifications);
   window.removeEventListener('pagehide',stopNotifications);closeButton?.removeEventListener('click',stopNotifications,true);
  }
  document.addEventListener('air-profile-changing',stopNotifications);
  window.addEventListener('pagehide',stopNotifications);closeButton?.addEventListener('click',stopNotifications,true);
  async function notifyChange(type){
   try{
    const expected=await owner;if(!expected||!notifyActive||!win.isConnected)return;
    const current=await window.airOS.currentUser();
    if(notifyActive&&win.isConnected&&current?.preferenceSession===expected)document.dispatchEvent(new Event(type));
   }catch{ /* A stale/unavailable session must never publish a change into another profile. */ }
  }
  let entries=[],selected=null,busy=false;
  const search=document.createElement('input');search.type='search';search.className='tahoe-reminder-search';search.placeholder='Aufgaben suchen';search.setAttribute('aria-label','Aufgaben suchen');
  const filter=document.createElement('select');filter.className='tahoe-reminder-filter';filter.setAttribute('aria-label','Aufgaben filtern');for(const [value,label]of [['all','Alle Aufgaben'],['open','Offen'],['done','Erledigt'],['today','Heute'],['overdue','Überfällig']]){const o=document.createElement('option');o.value=value;o.textContent=label;filter.append(o);}filter.value='all';list.before(search,filter);search.oninput=()=>draw();filter.onchange=()=>draw();
  function inform(message){if(notifyActive&&win.isConnected)status.textContent=message}
  let listName=null,listFilter=null;
  if(window.airOS?.platform==='web'){
   const label=document.createElement('label');label.textContent='Liste';listName=document.createElement('input');listName.className='arem-listname';listName.maxLength=60;listName.value='Erinnerungen';label.append(listName);form.prepend(label);
   listFilter=document.createElement('select');listFilter.setAttribute('aria-label','Liste filtern');list.before(listFilter);listFilter.onchange=()=>draw();
  }
  function select(item){
   selected=item?.id||null;title.value=item?.title||'';details.value=item?.details||'';
   if(listName)listName.value=item?.list||'Erinnerungen';
   date.value=item?.dueDate||'';priority.value=item?.priority||'none';done.checked=!!item?.completed;del.disabled=!selected;
   draw();
  }
  function draw(){
   list.replaceChildren();
   if(listFilter){const prior=listFilter.value;listFilter.replaceChildren(new Option('Alle Listen',''));for(const name of [...new Set(entries.map(e=>e.list||'Erinnerungen'))].sort())listFilter.append(new Option(name,name));listFilter.value=prior; if(!listFilter.value)listFilter.value='';}
   const sorted=[...entries].filter(item=>(!listFilter?.value||(item.list||'Erinnerungen')===listFilter.value)&&window.airTahoeAppModel.reminder(item,filter.value,search.value)).sort((a,b)=>Number(a.completed)-Number(b.completed)||(a.dueDate||'9999').localeCompare(b.dueDate||'9999')||a.title.localeCompare(b.title,'de-DE'));
   for(const item of sorted){
    const row=document.createElement('div');row.className='arem-row'+(selected===item.id?' selected':'');
    const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=!!item.completed;checkbox.setAttribute('aria-label',item.title+' als erledigt markieren');
    checkbox.disabled=busy;
    checkbox.addEventListener('change',async()=>{
     if(busy)return;busy=true;checkbox.disabled=true;
     try{await api.save({...item,completed:checkbox.checked,expectedSnapshot:item});await notifyChange('air-reminders-changed');await refresh(selected);inform('Aufgabe gespeichert.')}
     catch(e){checkbox.checked=!checkbox.checked;inform(e.message||'Speichern fehlgeschlagen.')}
     finally{busy=false;checkbox.disabled=false;draw()}
    });
    const button=document.createElement('button');button.type='button';button.className='arem-item';button.setAttribute('aria-pressed',String(selected===item.id));
    const name=document.createElement('strong');name.textContent=item.title;
    const info=document.createElement('small');info.textContent=item.dueDate?'Fällig: '+new Date(item.dueDate+'T12:00:00').toLocaleDateString('de-DE'):'Ohne Fälligkeitsdatum';
    if(item.completed)name.classList.add('arem-crossed');
    button.append(name,info);button.addEventListener('click',()=>{select(item);inform('Aufgabe geladen.')});
    row.append(checkbox,button);list.append(row);
   }
   count.textContent=entries.filter(e=>!e.completed).length+' offen · '+entries.length+' insgesamt';
   if(!sorted.length){const p=document.createElement('p');p.className='arem-empty';p.textContent=entries.length?'Keine Aufgaben für diesen Filter.':'Noch keine Aufgaben. Erstelle deine erste Erinnerung.';list.append(p)}
  }
  async function refresh(id){
   if(!notifyActive||!win.isConnected)return;const loaded=await api.list();if(!notifyActive||!win.isConnected)return;entries=loaded;const item=entries.find(e=>e.id===id)||null;select(item);
  }
  q('.arem-new').addEventListener('click',()=>{select(null);inform('Neue Erinnerung.');title.focus()});
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(busy)return;busy=true;save.disabled=true;
   try{
    const saved=await api.save({id:selected,expectedSnapshot:entries.find(n=>n.id===selected),title:title.value,details:details.value,dueDate:date.value||null,priority:priority.value,completed:done.checked,...(listName?{list:listName.value}:{} )});
    await notifyChange('air-reminders-changed');
    await refresh(saved.id);inform('Im Air-OS-Profil gespeichert.');
   }catch(e){inform(e.message||'Speichern fehlgeschlagen.')}
   finally{busy=false;save.disabled=false;draw()}
  });
  del.addEventListener('click',async()=>{
   if(!selected||busy||!confirm('Diese Erinnerung endgültig löschen?'))return;
   busy=true;del.disabled=true;
   try{await api.remove(selected);await notifyChange('air-reminders-changed');await refresh(null);inform('Erinnerung gelöscht.')}
   catch(e){inform(e.message||'Löschen fehlgeschlagen.')}
   finally{busy=false;del.disabled=!selected;draw()}
  });
  if(!api){inform('Erinnerungen benötigen die Air-OS Desktop-App.');save.disabled=true;return}
  refresh(null).then(()=>inform('Nur auf diesem Gerät.')).catch(e=>inform(e.message||'Aufgaben konnten nicht geladen werden.'));
 }
 window.airReminders={body,mount};
 if(typeof paintAppIcons==='function')paintAppIcons();
})();
// Read-only Home summary. No reminder details or persistent secondary cache are retained.
(() => {
 // Compare validated date-only strings with local calendar components, never UTC instants.
 function dateOnly(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
  const [y,m,d]=value.split('-').map(Number),leap=y%4===0&&(y%100!==0||y%400===0);
  return m>=1&&m<=12&&d>=1&&d<=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31][m-1]?value:null;
 }
 function preview(entries,now=new Date()){
  if(!Array.isArray(entries))throw new Error('Ungültige Erinnerungsliste.');
  const today=String(now.getFullYear()).padStart(4,'0')+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
  return entries.filter(item=>item&&item.completed===false&&typeof item.title==='string'&&item.title.trim())
   .map(item=>({title:item.title.trim(),due:dateOnly(item.dueDate)}))
   .sort((a,b)=>a.due===b.due?0:a.due===null?1:b.due===null?-1:a.due<b.due?-1:1)
   .slice(0,3).map(item=>{
    const date=item.due?item.due.slice(8,10)+'.'+item.due.slice(5,7)+'.'+item.due.slice(0,4):null;
    return {title:item.title,overdue:!!item.due&&item.due<today,label:!date?'Ohne Datum':item.due<today?'Überfällig · '+date:item.due===today?'Heute':'Fällig am '+date};
   });
 }
 function mount(win){
  const root=win.querySelector('.air-home-due');if(!root||root.dataset.remindersReady)return;
  root.dataset.remindersReady='1';
  const list=root.querySelector('.air-home-reminders-list'),status=root.querySelector('.air-home-reminders-status');
  const retry=root.querySelector('.air-home-reminders-refresh'),open=root.querySelector('.air-home-reminders-open');
  const close=win.querySelector('.close');
  let disposed=false,request=0,owner=null;
  const alive=token=>!disposed&&win.isConnected&&request===token;
  function clear(){list.replaceChildren();status.textContent='';retry.textContent='Aktualisieren'}
  function dispose(){
   if(disposed)return;disposed=true;request++;clear();open.disabled=true;retry.disabled=true;
   document.removeEventListener('air-reminders-changed',refresh);
   document.removeEventListener('air-profile-changing',dispose);
   window.removeEventListener('pagehide',dispose);
   close?.removeEventListener('click',dispose,true);observer.disconnect();
  }
  const observer=new MutationObserver(()=>{if(!win.isConnected)dispose()});
  if(win.parentNode)observer.observe(win.parentNode,{childList:true});
  async function sameOwner(token){
   const user=await window.airOS?.currentUser?.();
   if(!alive(token))return false;
   if(!user?.preferenceSession||owner!==user.preferenceSession){dispose();return false}
   return true;
  }
  async function refresh(){
   if(disposed||!win.isConnected)return;
   const token=++request;clear();status.textContent='Erinnerungen werden geladen …';
   try{
    const user=await window.airOS?.currentUser?.();if(!alive(token))return;
    if(!user?.preferenceSession)throw new Error('Keine authentifizierte Sitzung.');
    if(owner&&owner!==user.preferenceSession){dispose();return}
    owner=user.preferenceSession;
    const entries=await window.airOS.reminders.list();
    if(!alive(token)||!await sameOwner(token))return;
    const items=preview(entries);
    for(const item of items){
     const row=document.createElement('li'),title=document.createElement('span'),due=document.createElement('small');
     title.textContent=item.title;due.textContent=item.label;
     row.className=item.overdue?'is-overdue':'';row.append(title,due);list.append(row);
    }
    status.textContent=items.length?'':'Keine offenen Aufgaben.';
   }catch{
    if(!alive(token))return;
    // Never display a previous profile's response, including an old failure/retry state.
    if(owner){try{if(!await sameOwner(token))return}catch{if(!alive(token))return}}
    clear();status.textContent='Erinnerungen konnten nicht geladen werden. Bitte erneut versuchen.';retry.textContent='Erneut laden';
   }
  }
  retry.addEventListener('click',refresh);
  open.addEventListener('click',()=>{if(!disposed&&win.isConnected)openApp('reminders')});
  close?.addEventListener('click',dispose,true);
  document.addEventListener('air-reminders-changed',refresh);
  document.addEventListener('air-profile-changing',dispose);
  window.addEventListener('pagehide',dispose);
  refresh();return {refresh,dispose};
 }
 window.airHomeReminders={mount,preview};
})();

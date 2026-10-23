'use strict';
// Air Reminders: local tasks belonging to the currently authenticated profile.
(() => {
 const registry=window.airAppRegistry;
 if(!registry)return;
 registry.register('reminders',{name:'Air Erinnerungen',iconClass:'reminders-icon',glyph:'✓'});
 const icon='<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="arblue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d8effe"/><stop offset="1" stop-color="#aacff5"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="14" fill="url(#arblue)"/><rect x="12" y="11" width="40" height="43" rx="9" fill="#fafdff" stroke="#bddbf3"/><path d="m19 22 3 3 5-6m-8 16 3 3 5-6m-8 16 3 3 5-6" stroke="#268add" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 23h11M33 36h11M33 48h11" stroke="#a6c6e2" stroke-width="2.5" stroke-linecap="round"/></svg>';
 if(typeof vectorIcon!=='undefined')vectorIcon.reminders=icon;
 function body(){return '<section class="air-reminders"><header><div><small>AIR-OS · PRODUKTIVITÄT</small><h2>Erinnerungen</h2><p>Deine Aufgaben. Offline und nur in deinem Air-OS-Profil.</p></div><button type="button" class="arem-new">＋ Neu</button></header><div class="arem-layout"><aside class="arem-sidebar"><h3>AUFGABEN</h3><div class="arem-list"></div><p class="arem-count"></p></aside><form class="arem-editor"><label>Titel<input class="arem-title" maxlength="140" required placeholder="Was steht an?"></label><label>Beschreibung<textarea class="arem-details" maxlength="2000" rows="5" placeholder="Notizen zur Aufgabe (optional)"></textarea></label><div class="arem-options"><label>Fällig am<input class="arem-date" type="date"></label><label>Priorität<select class="arem-priority"><option value="none">Keine</option><option value="low">Niedrig</option><option value="medium">Mittel</option><option value="high">Hoch</option></select></label></div><label class="arem-complete"><input type="checkbox" class="arem-done"> Erledigt</label><div class="arem-footer"><span class="arem-status" role="status" aria-live="polite">Lokal gespeichert</span><button class="arem-delete" type="button" disabled>Löschen</button><button class="arem-save" type="submit">Speichern</button></div></form></div></section>'}
 function mount(win){
  const root=win.querySelector('.air-reminders');if(!root||root.dataset.mounted)return;root.dataset.mounted='1';
  const api=window.airOS?.reminders,q=s=>root.querySelector(s),list=q('.arem-list'),form=q('.arem-editor');
  const title=q('.arem-title'),details=q('.arem-details'),date=q('.arem-date'),priority=q('.arem-priority'),done=q('.arem-done');
  const save=q('.arem-save'),del=q('.arem-delete'),status=q('.arem-status'),count=q('.arem-count');
  let entries=[],selected=null,busy=false;
  function inform(message){status.textContent=message}
  function select(item){
   selected=item?.id||null;title.value=item?.title||'';details.value=item?.details||'';
   date.value=item?.dueDate||'';priority.value=item?.priority||'none';done.checked=!!item?.completed;del.disabled=!selected;
   draw();
  }
  function draw(){
   list.replaceChildren();
   const sorted=[...entries].sort((a,b)=>Number(a.completed)-Number(b.completed)||(a.dueDate||'9999').localeCompare(b.dueDate||'9999')||a.title.localeCompare(b.title,'de-DE'));
   for(const item of sorted){
    const row=document.createElement('div');row.className='arem-row'+(selected===item.id?' selected':'');
    const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=!!item.completed;checkbox.setAttribute('aria-label',item.title+' als erledigt markieren');
    checkbox.disabled=busy;
    checkbox.addEventListener('change',async()=>{
     if(busy)return;busy=true;checkbox.disabled=true;
     try{await api.save({...item,completed:checkbox.checked});await refresh(selected);inform('Aufgabe gespeichert.')}
     catch(e){checkbox.checked=!checkbox.checked;inform(e.message||'Speichern fehlgeschlagen.')}
     finally{busy=false;checkbox.disabled=false}
    });
    const button=document.createElement('button');button.type='button';button.className='arem-item';
    const name=document.createElement('strong');name.textContent=item.title;
    const info=document.createElement('small');info.textContent=item.dueDate?'Fällig: '+new Date(item.dueDate+'T12:00:00').toLocaleDateString('de-DE'):'Ohne Fälligkeitsdatum';
    if(item.completed)name.classList.add('arem-crossed');
    button.append(name,info);button.addEventListener('click',()=>{select(item);inform('Aufgabe geladen.')});
    row.append(checkbox,button);list.append(row);
   }
   count.textContent=entries.filter(e=>!e.completed).length+' offen · '+entries.length+' insgesamt';
   if(!entries.length){const p=document.createElement('p');p.className='arem-empty';p.textContent='Noch keine Aufgaben. Erstelle deine erste Erinnerung.';list.append(p)}
  }
  async function refresh(id){
   entries=await api.list();const item=entries.find(e=>e.id===id)||null;select(item);
  }
  q('.arem-new').addEventListener('click',()=>{select(null);inform('Neue Erinnerung.');title.focus()});
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(busy)return;busy=true;save.disabled=true;
   try{
    const saved=await api.save({id:selected,title:title.value,details:details.value,dueDate:date.value||null,priority:priority.value,completed:done.checked});
    await refresh(saved.id);inform('Im Air-OS-Profil gespeichert.');
   }catch(e){inform(e.message||'Speichern fehlgeschlagen.')}
   finally{busy=false;save.disabled=false}
  });
  del.addEventListener('click',async()=>{
   if(!selected||busy||!confirm('Diese Erinnerung endgültig löschen?'))return;
   busy=true;del.disabled=true;
   try{await api.remove(selected);await refresh(null);inform('Erinnerung gelöscht.')}
   catch(e){inform(e.message||'Löschen fehlgeschlagen.')}
   finally{busy=false;del.disabled=!selected}
  });
  if(!api){inform('Erinnerungen benötigen die Air-OS Desktop-App.');save.disabled=true;return}
  refresh(null).then(()=>inform('Nur auf diesem Gerät.')).catch(e=>inform(e.message||'Aufgaben konnten nicht geladen werden.'));
 }
 window.airReminders={body,mount};
 if(typeof paintAppIcons==='function')paintAppIcons();
})();
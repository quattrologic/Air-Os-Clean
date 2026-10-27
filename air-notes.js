'use strict';
// Air Notes: local, authenticated, per-profile CRUD. The renderer has no file paths.
(() => {
 const api=window.airOS?.notes;
 let pendingNote=null,activeNote=null;
 function focusNote(id){
  if(typeof id!=='string')return;
  pendingNote=id;
  if(activeNote&&activeNote.win.isConnected){activeNote.select(id);pendingNote=null}
 }

 function mount(win){
  const root=win.querySelector('.air-notes');if(!root||root.dataset.ready)return;root.dataset.ready='1';
  const q=s=>root.querySelector(s),title=q('#note-title'),body=q('#note-body'),list=q('#air-note-list'),status=q('#note-status');
  const saveButton=q('#save-note'),removeButton=q('#delete-note'),newButton=q('#new-note');
  if(!api){status.textContent='Notizen benötigen die Air-OS Desktop-App.';return}

  // Content-free confirmation belongs to this mounted app and its original login session.
  const owner=Promise.resolve(window.airOS?.currentUser?.()).then(user=>user?.preferenceSession).catch(()=>null);
  let notifyActive=true,loadVersion=0;
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
  let notes=[],selected=null,loading=false,saving=false;
  const announce=text=>status.textContent=text;
  const search=document.createElement('input');search.type='search';search.className='tahoe-note-search';search.placeholder='Notizen suchen';search.setAttribute('aria-label','Notiztitel suchen');list.before(search);search.addEventListener('input',()=>render());
  function render(){
   list.replaceChildren();
   for(const note of notes.filter(note=>!search.value||window.airTahoeAppModel.matches(note,search.value))){
    const button=document.createElement('button');button.type='button';button.className='air-note-item'+(selected===note.id?' selected':'');button.textContent=note.title.trim()||'Ohne Titel';
    button.title=note.title+' · '+new Date(note.updatedAt).toLocaleString('de-DE');button.setAttribute('aria-pressed',String(selected===note.id));
    button.addEventListener('click',()=>{if(!loading&&!saving)select(note)});list.append(button);
   }
   if(!list.children.length){const empty=document.createElement('p');empty.className='tahoe-note-empty';empty.textContent=notes.length?'Keine passenden Notizen.':'Noch keine Notizen.';list.append(empty);}
  }
  function select(note){
   selected=note?.id||null;title.value=note?.title||'';body.value=note?.body||'';announce(selected?'Notiz geladen.':'Neue Notiz');render();
  }
  async function refresh(preferredId){
   if(!notifyActive||!win.isConnected)return;const version=++loadVersion;loading=true;announce('Notizen werden geladen …');
   try{const loaded=await api.list();if(!notifyActive||!win.isConnected||version!==loadVersion)return;notes=loaded;const chosen=notes.find(n=>n.id===preferredId)||notes[0]||null;select(chosen)}
   catch(error){announce('Notizen konnten nicht geladen werden.');console.error(error)}
   finally{loading=false}
  }
  async function save(){
   if(loading||saving||!notifyActive||!win.isConnected)return;
   saving=true;saveButton.disabled=true;announce('Speichere …');
   try{
    const expectedSnapshot=notes.find(n=>n.id===selected);
    const saved=await api.save({id:selected,title:title.value,body:body.value,...(expectedSnapshot?{expectedSnapshot}: {})});
    // Only acknowledged saves emit a fixed, content-free local notification.
    await notifyChange('air-notes-saved');if(!notifyActive||!win.isConnected)return;
    // A save acknowledges its submitted snapshot, not edits made while waiting.
    // Update the list from that acknowledgement without reloading the editor.
    const index=notes.findIndex(note=>note.id===saved.id);
    if(index<0)notes.unshift(saved);else notes[index]=saved;
    selected=saved.id;render();
    announce(title.value===saved.title&&body.value===saved.body
     ?'Notiz im Benutzerprofil gespeichert.'
     :'Stand gespeichert. Neuere Änderungen sind noch nicht gespeichert.');
   }catch(error){announce(error.message||'Speichern fehlgeschlagen.');console.error(error)}
   finally{saving=false;saveButton.disabled=false}
  }
  saveButton.addEventListener('click',save);
  newButton.addEventListener('click',()=>{if(!loading&&!saving)select(null)});
  removeButton.addEventListener('click',async()=>{
   if(loading||saving)return;
   if(!selected){title.value='';body.value='';announce('Neue Notiz verworfen.');return}
   if(!confirm('Diese Notiz wirklich löschen?'))return;
   try{await api.remove(selected,notes.find(n=>n.id===selected));await notifyChange('air-notes-changed');await notifyChange('air-notes-deleted');selected=null;await refresh();announce('Notiz gelöscht.')}
   catch(error){announce('Löschen fehlgeschlagen.');console.error(error)}
  });
  activeNote={win,select:id=>{if(!loading&&!saving)refresh(id)},hasUnsaved:()=>{const stored=notes.find(n=>n.id===selected);return loading||saving||(stored?title.value!==stored.title||body.value!==stored.body:!!(title.value||body.value));}};
  refresh(pendingNote);pendingNote=null;
 }
 window.airNotes={mount,focusNote,hasUnsaved:()=>!!activeNote?.win.isConnected&&activeNote.hasUnsaved()};
})();

// Read-only Home summary. No note bodies or persistent secondary cache are retained.
(() => {
 function mount(win){
  const root=win.querySelector('.air-home-inbox');if(!root||root.dataset.notesReady)return;
  root.dataset.notesReady='1';
  const list=root.querySelector('.air-home-notes-list'),status=root.querySelector('.air-home-notes-status');
  const retry=root.querySelector('.air-home-notes-retry'),open=root.querySelector('.air-home-notes-open');
  const close=win.querySelector('.close');
  let disposed=false,request=0,owner=null;
  const alive=token=>!disposed&&win.isConnected&&request===token;
  function clear(){list.replaceChildren();status.textContent='';retry.hidden=true}
  function dispose(){
   if(disposed)return;disposed=true;request++;clear();open.disabled=true;
   document.removeEventListener('air-notes-saved',refresh);
   document.removeEventListener('air-notes-changed',refresh);
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
   const token=++request;clear();status.textContent='Notizen werden geladen …';
   try{
    const user=await window.airOS?.currentUser?.();if(!alive(token))return;
    if(!user?.preferenceSession)throw new Error('Keine authentifizierte Sitzung.');
    if(owner&&owner!==user.preferenceSession){dispose();return}
    owner=user.preferenceSession;
    const notes=await window.airOS.notes.list();
    if(!alive(token)||!await sameOwner(token))return;
    if(!Array.isArray(notes))throw new Error('Ungültige Notizliste.');
    // Invalid dates sort last; stable ties retain store order. Never render note HTML/body.
    const timestamp=value=>typeof value==='string'&&Number.isFinite(Date.parse(value))?Date.parse(value):-Infinity;
    const recent=notes.filter(note=>note&&typeof note.title==='string')
     .map(note=>({title:note.title.trim()||'Ohne Titel',time:timestamp(note.updatedAt)}))
     .sort((a,b)=>b.time-a.time).slice(0,3);
    for(const note of recent){const item=document.createElement('li');item.textContent=note.title;list.append(item)}
    status.textContent=recent.length?'':'Noch keine Notizen vorhanden.';
   }catch{
    if(!alive(token))return;
    // Never display a previous profile's response, including an old failure/retry state.
    if(owner){try{if(!await sameOwner(token))return}catch{if(!alive(token))return}}
    clear();status.textContent='Notizen konnten nicht geladen werden. Bitte erneut versuchen.';retry.hidden=false;
   }
  }
  retry.addEventListener('click',refresh);
  open.addEventListener('click',()=>{if(!disposed&&win.isConnected)openApp('notes')});
  close?.addEventListener('click',dispose,true);
  document.addEventListener('air-notes-saved',refresh);
  document.addEventListener('air-notes-changed',refresh);
  document.addEventListener('air-profile-changing',dispose);
  window.addEventListener('pagehide',dispose);
  refresh();return {refresh,dispose};
 }
 window.airHomeNotes={mount};
})();

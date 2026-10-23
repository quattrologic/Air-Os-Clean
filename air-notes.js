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
  let notes=[],selected=null,loading=false,saving=false;
  const announce=text=>status.textContent=text;
  function render(){
   list.replaceChildren();
   for(const note of notes){
    const button=document.createElement('button');button.type='button';button.className='air-note-item'+(selected===note.id?' selected':'');button.textContent=note.title.trim()||'Ohne Titel';
    button.title=new Date(note.updatedAt).toLocaleString('de-DE');
    button.addEventListener('click',()=>select(note));list.append(button);
   }
  }
  function select(note){
   selected=note?.id||null;title.value=note?.title||'';body.value=note?.body||'';announce(selected?'Notiz geladen.':'Neue Notiz');render();
  }
  async function refresh(preferredId){
   loading=true;announce('Notizen werden geladen …');
   try{notes=await api.list();const chosen=notes.find(n=>n.id===preferredId)||notes[0]||null;select(chosen)}
   catch(error){announce('Notizen konnten nicht geladen werden.');console.error(error)}
   finally{loading=false}
  }
  async function save(){
   if(loading||saving)return;
   saving=true;saveButton.disabled=true;announce('Speichere …');
   try{
    const saved=await api.save({id:selected,title:title.value,body:body.value});
    // Only acknowledged saves emit a fixed, content-free local notification.
    document.dispatchEvent(new Event('air-notes-saved'));
    selected=saved.id;await refresh(selected);announce('Notiz im Benutzerprofil gespeichert.');
   }catch(error){announce(error.message||'Speichern fehlgeschlagen.');console.error(error)}
   finally{saving=false;saveButton.disabled=false}
  }
  saveButton.addEventListener('click',save);
  newButton.addEventListener('click',()=>select(null));
  removeButton.addEventListener('click',async()=>{
   if(!selected){title.value='';body.value='';announce('Neue Notiz verworfen.');return}
   if(!confirm('Diese Notiz wirklich löschen?'))return;
   try{await api.remove(selected);selected=null;await refresh();announce('Notiz gelöscht.')}
   catch(error){announce('Löschen fehlgeschlagen.');console.error(error)}
  });
  activeNote={win,select:id=>refresh(id)};
  refresh(pendingNote);pendingNote=null;
 }
 window.airNotes={mount,focusNote};
})();

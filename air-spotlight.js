'use strict';
(() => {
 const search=window.airSearchService,registry=window.airAppRegistry;if(!search||!registry)return;
 const trigger=document.querySelector('#air-search-open');if(!trigger)return;
 const overlay=document.createElement('div');overlay.className='air-search-overlay';overlay.hidden=true;
 const dialog=document.createElement('section');dialog.className='air-search-dialog';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Air-OS App-Suche');
 const input=document.createElement('input');input.type='search';input.className='air-search-field';input.setAttribute('aria-label','Anwendung suchen');input.placeholder='Apps und Notizen suchen …';
 const help=document.createElement('p');help.textContent='Apps und eigene Notiztitel durchsuchen · Esc zum Schließen';
 const results=document.createElement('div');results.className='air-search-results';results.setAttribute('role','listbox');results.setAttribute('aria-label','Suchergebnisse');
 dialog.append(input,help,results);overlay.append(dialog);document.body.append(overlay);
 let before=null,options=[],selected=0,requestVersion=0;
 function close(){requestVersion++;if(overlay.hidden)return;overlay.hidden=true;input.value='';results.replaceChildren();before?.focus?.();trigger.setAttribute('aria-expanded','false')}
 function choose(index){
  const chosen=options[index];if(!chosen)return;close();
  if(chosen.type==='note'){openApp('notes');window.airNotes?.focusNote(chosen.id)}
  else openApp(chosen.id);
 }
 function paint(){
  results.replaceChildren();
  if(!options.length){const p=document.createElement('p');p.className='air-search-empty';p.textContent='Keine passenden Apps oder Notizen gefunden.';results.append(p);return}
  options.forEach((item,i)=>{
   const b=document.createElement('button');b.type='button';b.className='air-search-result';b.setAttribute('role','option');b.setAttribute('aria-selected',String(i===selected));b.dataset.index=String(i);
   const glyph=document.createElement('span');glyph.className='air-search-result-icon';
   if(item.type==='note')glyph.textContent='✎';
   else{const dock=item.iconClass?document.querySelector('.dock-icon.'+item.iconClass):null;if(dock?.querySelector('svg'))glyph.append(dock.querySelector('svg').cloneNode(true));else glyph.textContent=registry.get(item.id)?.glyph||'◇'}
   const name=document.createElement('span');name.textContent=item.type==='note'?'Notiz: '+item.title:item.name;b.append(glyph,name);
   b.addEventListener('click',()=>choose(i));results.append(b);
  });
 }
 function render(){
  const current=++requestVersion,query=input.value;
  options=search.findApps(registry,query,25);selected=0;paint();
  if(query.trim().length<2||!window.airOS?.notes?.list)return;
  window.airOS.notes.list().then(entries=>{
   if(current!==requestVersion||overlay.hidden)return;
   const matches=search.findNotes(entries,query,12);
   options=[...search.findApps(registry,query,25),...matches];
   selected=0;paint();
  }).catch(()=>{/* No notes accessible; keep app search usable. */});
 }
 function highlight(){results.querySelectorAll('button').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===selected));if(i===selected)b.scrollIntoView({block:'nearest'})})}
 function open(){before=document.activeElement;overlay.hidden=false;trigger.setAttribute('aria-expanded','true');render();input.focus()}
 trigger.setAttribute('aria-expanded','false');trigger.addEventListener('click',()=>overlay.hidden?open():close());
 overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)close()});
 input.addEventListener('input',render);
 document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&e.key.toLowerCase()==='k'){e.preventDefault();overlay.hidden?open():close();return}
  if(overlay.hidden)return;
  if(e.key==='Escape'){e.preventDefault();close()}
  if(e.key==='ArrowDown'&&options.length){e.preventDefault();selected=(selected+1)%options.length;highlight()}
  if(e.key==='ArrowUp'&&options.length){e.preventDefault();selected=(selected-1+options.length)%options.length;highlight()}
  if(e.key==='Enter'&&options.length){e.preventDefault();choose(selected)}
 },true);
})();

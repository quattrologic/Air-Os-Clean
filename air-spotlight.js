'use strict';
(() => {
 const search=window.airSearchService,registry=window.airAppRegistry;if(!search||!registry)return;
 const trigger=document.querySelector('#air-search-open');if(!trigger)return;
 const overlay=document.createElement('div');overlay.className='air-search-overlay';overlay.hidden=true;
 const dialog=document.createElement('section');dialog.className='air-search-dialog';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Air-OS App-Suche');
 const input=document.createElement('input');input.type='search';input.className='air-search-field';input.setAttribute('aria-label','Anwendung suchen');input.placeholder='Apps, Notizen und Dateien suchen …';
 const help=document.createElement('p');help.textContent='Apps, eigene Notiztitel und Dateien aus freigegebenen Ordnern · Esc zum Schließen';
 const results=document.createElement('div');results.className='air-search-results';results.setAttribute('role','listbox');results.setAttribute('aria-label','Suchergebnisse');
 dialog.append(input,help,results);overlay.append(dialog);document.body.append(overlay);
 let before=null,options=[],selected=0,requestVersion=0,fileTimer=null;
 function close(){requestVersion++;if(fileTimer!==null){clearTimeout(fileTimer);fileTimer=null;}if(overlay.hidden)return;overlay.hidden=true;input.value='';results.replaceChildren();before?.focus?.();trigger.setAttribute('aria-expanded','false')}
 function choose(index){
  const chosen=options[index];if(!chosen)return;close();
  if(chosen.type==='calculation'){openApp('calculator');return;}
  if(chosen.type==='note'){openApp('notes');window.airNotes?.focusNote(chosen.id)}
  else if(chosen.type==='file'){openApp('finder');Promise.resolve(window.airFinder?.revealFile(chosen.path,chosen.kind)).catch(()=>{});}
  else openApp(chosen.id);
 }
 function paint(){
  results.replaceChildren();
  if(!options.length){const p=document.createElement('p');p.className='air-search-empty';p.textContent='Keine passenden Apps, Notizen oder freigegebenen Dateien gefunden.';results.append(p);return}
  options.forEach((item,i)=>{
   const b=document.createElement('button');b.type='button';b.className='air-search-result';b.setAttribute('role','option');b.setAttribute('aria-selected',String(i===selected));b.dataset.index=String(i);
   const glyph=document.createElement('span');glyph.className='air-search-result-icon';
   if(item.type==='calculation')glyph.textContent='=';
   else if(item.type==='note')glyph.textContent='✎';
   else if(item.type==='file')glyph.textContent=item.kind==='folder'?'▱':'▤';
   else{const dock=item.iconClass?document.querySelector('.dock-icon.'+item.iconClass):null;if(dock?.querySelector('svg'))glyph.append(dock.querySelector('svg').cloneNode(true));else glyph.textContent=registry.get(item.id)?.glyph||'◇'}
   const name=document.createElement('span');name.textContent=item.type==='calculation'?item.name:item.type==='note'?'Notiz: '+item.title:item.type==='file'?'Datei: '+item.name+' · '+item.path:item.name;b.append(glyph,name);
   b.addEventListener('click',()=>choose(i));results.append(b);
  });
 }
 function render(){
  if(fileTimer!==null){clearTimeout(fileTimer);fileTimer=null;}
  const current=++requestVersion,query=input.value;
  const apps=search.findApps(registry,query,25);
  let notes=[],files=[];
  const refresh=()=>{
   if(current!==requestVersion||overlay.hidden)return;
   const value=window.airMacShellMath?.calcValue(query);
   const calculation=value!==null&&value!==undefined?[{type:'calculation',name:query+' = '+value,id:'calculator'}]:[];
   options=[...calculation,...apps,...notes,...files];selected=0;paint();
  };
  refresh();
  if(query.trim().length<2)return;
  if(window.airOS?.notes?.list){
   window.airOS.notes.list().then(entries=>{
    notes=search.findNotes(entries,query,12);refresh();
   }).catch(()=>{/* Not authenticated or unavailable; app search remains usable. */});
  }
  if(window.airOS?.files?.searchNames){
   // Debounce filesystem reads; stale asynchronous responses never replace
   // newer Spotlight results. The main process bounds search depth and size.
   fileTimer=setTimeout(()=>{
    fileTimer=null;
    window.airOS.files.searchNames(query).then(result=>{
     if(current!==requestVersion)return;
     files=Array.isArray(result?.items)?result.items.slice(0,20).map(item=>({
      type:'file',name:item.name,path:item.path,kind:item.kind
     })):[];
     refresh();
    }).catch(()=>{/* No approved Finder folder; never search other locations. */});
   },180);
  }
 }
 function highlight(){results.querySelectorAll('button').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===selected));if(i===selected)b.scrollIntoView({block:'nearest'})})}
 function open(){before=document.activeElement;overlay.hidden=false;trigger.setAttribute('aria-expanded','true');render();input.focus()}
 document.addEventListener('air-profile-changing',close);window.addEventListener('pagehide',close);
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

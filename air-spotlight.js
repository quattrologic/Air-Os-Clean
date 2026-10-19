'use strict';
(() => {
 const search=window.airSearchService,registry=window.airAppRegistry;if(!search||!registry)return;
 const trigger=document.querySelector('#air-search-open');if(!trigger)return;
 const overlay=document.createElement('div');overlay.className='air-search-overlay';overlay.hidden=true;
 const dialog=document.createElement('section');dialog.className='air-search-dialog';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Air-OS App-Suche');
 const input=document.createElement('input');input.type='search';input.className='air-search-field';input.setAttribute('aria-label','Anwendung suchen');input.placeholder='App suchen …';
 const help=document.createElement('p');help.textContent='Anwendungen durchsuchen · Esc zum Schließen';
 const results=document.createElement('div');results.className='air-search-results';results.setAttribute('role','listbox');results.setAttribute('aria-label','Suchergebnisse');
 dialog.append(input,help,results);overlay.append(dialog);document.body.append(overlay);
 let before=null,options=[],selected=0;
 function close(){if(overlay.hidden)return;overlay.hidden=true;input.value='';results.replaceChildren();before?.focus?.();trigger.setAttribute('aria-expanded','false')}
 function choose(index){const chosen=options[index];if(!chosen)return;close();openApp(chosen.id)}
 function render(){
  options=search.findApps(registry,input.value,30);selected=0;results.replaceChildren();
  if(!options.length){const p=document.createElement('p');p.className='air-search-empty';p.textContent='Keine passende Air-OS-App gefunden.';results.append(p);return}
  options.forEach((app,i)=>{
   const b=document.createElement('button');b.type='button';b.className='air-search-result';b.setAttribute('role','option');b.setAttribute('aria-selected',String(i===selected));b.dataset.index=String(i);
   const glyph=document.createElement('span');glyph.className='air-search-result-icon';const dock=app.iconClass?document.querySelector('.dock-icon.'+app.iconClass):null;
   if(dock?.querySelector('svg'))glyph.append(dock.querySelector('svg').cloneNode(true));else glyph.textContent=registry.get(app.id)?.glyph||'◇';
   const name=document.createElement('span');name.textContent=app.name;b.append(glyph,name);
   b.addEventListener('click',()=>choose(i));results.append(b);
  });
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

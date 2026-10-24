'use strict';
(() => {
 const registry=window.airAppRegistry;if(!registry)return;
 registry.register('launchpad',{name:'Launchpad',iconClass:'launchpad-icon',glyph:'▦'});
 const kinds=['Alle','System','Produktivität','Medien & Web','Spiele'];
 const category=id=>['finder','downloads','trash','settings','about','launchpad'].includes(id)?'System':id==='arcade'?'Spiele':['airwrite','notes','reminders','calendar','mail','calculator','translator','ai','aircard'].includes(id)?'Produktivität':'Medien & Web';
 function body(){return '<section class="air-launchpad"><header><div><small>AIR-OS · APPS</small><h2>Launchpad</h2><p>Deine Anwendungen an einem Ort.</p></div><input type="search" class="alp-search" aria-label="Apps durchsuchen" placeholder="App suchen …"></header><div class="alp-categories" role="group" aria-label="Kategorien"></div><p class="alp-count" aria-live="polite"></p><div class="alp-grid" aria-label="Installierte Anwendungen"></div></section>'}
 function mount(win){
  const root=win.querySelector('.air-launchpad');if(!root||root.dataset.mounted)return;root.dataset.mounted='true';
  const search=root.querySelector('.alp-search'),tabs=root.querySelector('.alp-categories'),grid=root.querySelector('.alp-grid'),count=root.querySelector('.alp-count');let selected='Alle';
  for(const label of kinds){const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.category=label;button.addEventListener('click',()=>{selected=label;render()});tabs.append(button)}
  function render(){
   const query=search.value.trim().toLocaleLowerCase('de-DE');tabs.querySelectorAll('button').forEach(btn=>btn.classList.toggle('selected',btn.dataset.category===selected));
   const apps=registry.list().filter(a=>!['about','trash'].includes(a.id)&&(selected==='Alle'||category(a.id)===selected)&&(!query||a.name.toLocaleLowerCase('de-DE').includes(query)||a.id.includes(query)));
   count.textContent=apps.length+' Anwendungen';grid.replaceChildren();
   for(const app of apps){
    const b=document.createElement('button');b.type='button';b.className='alp-app';b.dataset.app=app.id;b.title=app.name;
    const art=document.createElement('span');art.className='alp-icon';const dock=app.iconClass?document.querySelector('.dock-icon.'+app.iconClass):null;
    if(dock&&dock.querySelector('svg'))art.append(dock.querySelector('svg').cloneNode(true));else art.textContent=app.glyph||'◇';
    const name=document.createElement('span');name.textContent=app.name;
    const state=window.airAppLifecycle?.get(app.id);if(state&&state!=='closed'){const dot=document.createElement('i');dot.className='alp-running';dot.title='Läuft';art.append(dot)}
    b.append(art,name);grid.append(b);
   }
  }
  search.addEventListener('input',render);
  const off=window.airAppLifecycle?.onChange(()=>{if(win.isConnected)render()});
  const offRegistry=registry.onChange(()=>{if(win.isConnected)render()});
  const host=document.querySelector('#windows');if(host){const observer=new MutationObserver(()=>{if(!win.isConnected){off?.();offRegistry?.();observer.disconnect()}});observer.observe(host,{childList:true})}
  render();
 }
 const classicLaunchpadIcon='<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="60" height="60" rx="14" fill="#b8dffa"/>'+Array.from({length:9},(_,i)=>'<rect x="'+(13+i%3*15)+'" y="'+(13+Math.floor(i/3)*15)+'" width="10" height="10" rx="3" fill="'+(i===4?'#248ed7':'#f9fcff')+'"/>').join('')+'</svg>';
 const airLaunchpadLogo='<svg viewBox="175 10 455 775" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M365,233 344,243 332,257 324,278 312,340 291,395 274,422 234,467 216,498 208,521 202,558 202,588 206,619 221,666 243,704 268,733 299,756 320,765 347,770 370,767 401,757 423,758 454,769 483,769 520,755 544,738 565,717 586,688 603,649 567,638 543,622 518,593 505,564 501,544 501,520 507,495 527,459 554,435 533,406 515,368 503,327 496,282 487,259 472,242 452,233 435,233 411,240 396,238 383,233Z M512,28 496,32 472,47 447,72 426,102 416,124 408,152 406,183 410,205 422,202 449,186 472,164 490,140 505,110 514,77 516,48Z" fill="#fff" stroke="none" stroke-linejoin="round"/></svg>';
 function syncLaunchpadLogo(){
  const icon=(typeof readAirSettings==='function'?readAirSettings():{}).desktopTheme==='modern'?airLaunchpadLogo:classicLaunchpadIcon;
  vectorIcon.launchpad=icon;
  document.querySelectorAll?.('.launchpad-icon')?.forEach(element=>{element.innerHTML=icon});
 }
 document.addEventListener?.('air-settings-changed',syncLaunchpadLogo);
 syncLaunchpadLogo();
 window.airLaunchpad={body,mount};
 if(typeof paintAppIcons==='function')paintAppIcons();
 // B2: a small view of the same Registry and launch path, not a second app catalog.
 const menu=document.querySelector('#air-start-menu'),trigger=document.querySelector('.dock [data-app="launchpad"]');
 if(!menu||!trigger)return;
 const input=menu.querySelector('#air-start-search'),results=menu.querySelector('#air-start-results'),status=menu.querySelector('#air-start-status');
 const filters=menu.querySelector('#air-start-filters'),allFilter=menu.querySelector('#air-start-filter-all'),pinnedFilter=menu.querySelector('#air-start-filter-pinned');
 let busy=false,pinBusy=false,version=0,filter='all',interaction=0,summary=true;
 const enabled=()=>readAirSettings().dockTheme==='modern';
 function position(){
  const dock=document.querySelector('.dock').getBoundingClientRect();
  menu.style.bottom=(window.innerHeight-dock.top+10)+'px';
  menu.style.maxHeight=Math.max(120,Math.min(440,dock.top-90))+'px';
 }
 function close(restore=true){
  if(menu.hidden)return;
  menu.hidden=true;version++;busy=false;trigger.setAttribute('aria-expanded','false');
  if(restore)trigger.focus();
 }
 async function launch(id){
  if(busy)return;
  if(!registry.get(id)){summary=false;status.textContent='Diese App ist nicht mehr verfügbar.';render(false);return}
  busy=true;summary=false;const request=++version;status.textContent='App wird gestartet …';
  results.querySelectorAll('button').forEach(button=>button.disabled=true);
  try{
   const outcome=await openApp(id);
   if(request!==version)return;
   if(!outcome?.ok)throw new Error(outcome?.error||'Die App konnte nicht gestartet werden.');
   close();
  }catch(error){if(request===version){status.textContent=String(error.message||'Die App konnte nicht gestartet werden.').replace(/^Error invoking remote method '[^']+': (?:Error: )?/,'');busy=false;input.disabled=false;render(false);input.focus()}}
 }
 async function pin(id,pinned){
  if(pinBusy||busy)return;
  pinBusy=true;summary=false;const request=version;status.textContent='Dock-Pins werden gespeichert …';render(false);const startedInteraction=interaction;
  try{
   await persistAirDockPin(id,pinned);
   if(request!==version)return;
   status.textContent=pinned?'App angeheftet.':'App vom Dock gelöst.';
  }catch(error){
   if(request!==version)return;
   if(error.code==='AIR_PROFILE_CHANGED'){close(false);return}
   status.textContent='Dock-Pins konnten nicht gespeichert werden. '+String(error.message||'').replace(/^Error invoking remote method '[^']+': (?:Error: )?/,'');
  }finally{
   pinBusy=false;
   if(!menu.hidden){render(false);if(request===version&&startedInteraction===interaction){const action=Array.from(results.querySelectorAll('[data-pin-app]')).find(button=>button.dataset.pinApp===id);(action&&!action.disabled?action:input).focus()}}
  }
 }
 function render(clearStatus=true){
  const focusedApp=document.activeElement?.dataset.startApp,focusedPin=document.activeElement?.dataset.pinApp;
  const settings=readAirSettings(),hybrid=settings.desktopTheme==='modern';
  if(!hybrid)filter='all';
  filters.hidden=!hybrid;allFilter.setAttribute('aria-pressed',String(filter==='all'));pinnedFilter.setAttribute('aria-pressed',String(filter==='pinned'));
  const references=airDockReferences(settings.dockPins);
  const query=input.value.trim().toLocaleLowerCase('de-DE');
  const apps=registry.list().filter(app=>(filter==='all'||references.includes(app.id))).filter(app=>app.name.toLocaleLowerCase('de-DE').includes(query)||app.id.toLocaleLowerCase('de-DE').includes(query));
  results.replaceChildren();
  if((clearStatus||summary)&&!busy&&!pinBusy){summary=true;status.textContent=apps.length?apps.length+' Anwendungen':filter==='pinned'&&!query?'Keine angehefteten Apps.':'Keine passenden Apps gefunden.';}
  for(const app of apps){
   const button=document.createElement('button'),art=document.createElement('span'),name=document.createElement('span');
   button.type='button';button.dataset.startApp=app.id;button.disabled=busy;button.setAttribute('aria-label',app.name);
   art.className='air-start-icon';name.textContent=app.name;
   const original=app.iconClass?document.querySelector('.dock-icon.'+app.iconClass+' svg'):null;
   if(original)art.append(original.cloneNode(true));
   else if(vectorIcon[app.id])art.innerHTML=vectorIcon[app.id]; // trusted, existing static icon data only
   else art.textContent=app.glyph||'';
   const entry=document.createElement('div'),label=document.createElement('span'),badge=document.createElement('small');
   entry.className='air-start-entry';label.className='air-start-label';
   const settings=readAirSettings(),pinned=app.id==='launchpad'||airDockReferences(settings.dockPins).includes(app.id);
   const visible=airDockSelection(registry,settings.dockPins,window.innerWidth,settings.dockSize).visible.includes(app.id);
   badge.textContent=app.id==='launchpad'?'Startmenü · immer sichtbar':pinned?(visible?'Angeheftet · im Dock':'Angeheftet · unter Alle Apps'):'';
   label.append(name,badge);button.append(art,label);button.addEventListener('click',()=>launch(app.id));entry.append(button);
   if(app.id!=='launchpad'){
    const action=document.createElement('button');action.type='button';action.dataset.pinApp=app.id;
    const supported=airDockCanPin(app.id);
    action.textContent=pinned?'Vom Dock lösen':supported?'Anheften':'Kein Dock-Icon';
    action.setAttribute('aria-label',app.name+(pinned?' von Dock lösen':' an Dock anheften'));
    action.disabled=busy||pinBusy||(!supported&&!pinned);
    if(!supported&&!pinned)action.title='Für diese App ist kein unterstütztes Dock-Icon verfügbar.';
    action.addEventListener('click',()=>pin(app.id,!pinned));entry.append(action);
   }
   results.append(entry);
  }
  if(focusedApp){const next=Array.from(results.querySelectorAll('[data-start-app]')).find(button=>button.dataset.startApp===focusedApp&&!button.disabled);(next||input).focus()}
  else if(focusedPin){const next=Array.from(results.querySelectorAll('[data-pin-app]')).find(button=>button.dataset.pinApp===focusedPin&&!button.disabled);(next||input).focus()}
 }
 function toggle(){
  if(!enabled())return;
  if(!menu.hidden){close();return}
  input.value='';filter='all';input.disabled=false;busy=false;render();position();menu.hidden=false;trigger.setAttribute('aria-expanded','true');input.focus();
 }
 menu.querySelector('#air-start-close').addEventListener('click',()=>close());
 menu.querySelector('#air-start-full').addEventListener('click',()=>launch('launchpad'));
 input.addEventListener('input',()=>{interaction++;render()});
 input.addEventListener('focus',()=>{interaction++});
 for(const [button,value] of [[allFilter,'all'],[pinnedFilter,'pinned']])button.addEventListener('click',()=>{if(readAirSettings().desktopTheme!=='modern')return;filter=value;interaction++;render()});
 menu.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return}
  interaction++;
  const buttons=Array.from(results.querySelectorAll('[data-start-app]:not([disabled])'));
  if(event.target===input&&event.key==='Enter'){event.preventDefault();if(buttons[0])buttons[0].click()}
  if(['ArrowDown','ArrowUp'].includes(event.key)&&buttons.length){event.preventDefault();const index=buttons.indexOf(document.activeElement);buttons[index<0?(event.key==='ArrowDown'?0:buttons.length-1):(index+(event.key==='ArrowDown'?1:buttons.length-1))%buttons.length].focus()}
 });
 document.addEventListener('keydown',event=>{if(!menu.hidden&&event.key==='Escape'){event.preventDefault();close()}});
 document.addEventListener('click',event=>{if(!menu.hidden&&!menu.contains(event.target)&&!event.composedPath?.().includes(menu)&&!trigger.contains(event.target))close()});
 document.addEventListener('air-settings-changed',()=>{if(!enabled())close();if(!menu.hidden){position();render(false)}trigger.setAttribute('aria-expanded',String(!menu.hidden))});
 window.addEventListener('resize',()=>{if(!menu.hidden){position();render(false)}});
 registry.onChange(()=>{if(!menu.hidden)render()});
 trigger.setAttribute('aria-controls','air-start-menu');trigger.setAttribute('aria-expanded','false');
 window.airStartMenu={enabled,toggle};
})();

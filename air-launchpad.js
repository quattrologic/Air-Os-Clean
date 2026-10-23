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
 vectorIcon.launchpad='<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="60" height="60" rx="14" fill="#b8dffa"/>'+Array.from({length:9},(_,i)=>'<rect x="'+(13+i%3*15)+'" y="'+(13+Math.floor(i/3)*15)+'" width="10" height="10" rx="3" fill="'+(i===4?'#248ed7':'#f9fcff')+'"/>').join('')+'</svg>';
 window.airLaunchpad={body,mount};
 if(typeof paintAppIcons==='function')paintAppIcons();
 // B2: a small view of the same Registry and launch path, not a second app catalog.
 const menu=document.querySelector('#air-start-menu'),trigger=document.querySelector('.dock [data-app="launchpad"]');
 if(!menu||!trigger)return;
 const input=menu.querySelector('#air-start-search'),results=menu.querySelector('#air-start-results'),status=menu.querySelector('#air-start-status');
 let busy=false,version=0;
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
  if(!registry.get(id)){status.textContent='Diese App ist nicht mehr verfügbar.';render();return}
  busy=true;const request=++version;status.textContent='App wird gestartet …';input.disabled=true;
  results.querySelectorAll('button').forEach(button=>button.disabled=true);
  try{
   const outcome=await openApp(id);
   if(request!==version)return;
   if(!outcome?.ok)throw new Error(outcome?.error||'Die App konnte nicht gestartet werden.');
   close();
  }catch(error){if(request===version){status.textContent=String(error.message||'Die App konnte nicht gestartet werden.').replace(/^Error invoking remote method '[^']+': (?:Error: )?/,'');busy=false;input.disabled=false;render(false);input.focus()}}
 }
 function render(clearStatus=true){
  const query=input.value.trim().toLocaleLowerCase('de-DE');
  const apps=registry.list().filter(app=>app.name.toLocaleLowerCase('de-DE').includes(query)||app.id.toLocaleLowerCase('de-DE').includes(query));
  results.replaceChildren();
  if(clearStatus)status.textContent=apps.length?apps.length+' Anwendungen':'Keine passenden Apps gefunden.';
  for(const app of apps){
   const button=document.createElement('button'),art=document.createElement('span'),name=document.createElement('span');
   button.type='button';button.dataset.startApp=app.id;button.disabled=busy;button.setAttribute('aria-label',app.name);
   art.className='air-start-icon';name.textContent=app.name;
   const original=app.iconClass?document.querySelector('.dock-icon.'+app.iconClass+' svg'):null;
   if(original)art.append(original.cloneNode(true));
   else if(vectorIcon[app.id])art.innerHTML=vectorIcon[app.id]; // trusted, existing static icon data only
   else art.textContent=app.glyph||'';
   button.append(art,name);button.addEventListener('click',()=>launch(app.id));results.append(button);
  }
 }
 function toggle(){
  if(!enabled())return;
  if(!menu.hidden){close();return}
  input.value='';input.disabled=false;busy=false;render();position();menu.hidden=false;trigger.setAttribute('aria-expanded','true');input.focus();
 }
 menu.querySelector('#air-start-close').addEventListener('click',()=>close());
 menu.querySelector('#air-start-full').addEventListener('click',()=>launch('launchpad'));
 input.addEventListener('input',()=>render());
 menu.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return}
  const buttons=Array.from(results.querySelectorAll('button:not([disabled])'));
  if(event.target===input&&event.key==='Enter'){event.preventDefault();if(buttons[0])buttons[0].click()}
  if(['ArrowDown','ArrowUp'].includes(event.key)&&buttons.length){event.preventDefault();const index=buttons.indexOf(document.activeElement);buttons[index<0?(event.key==='ArrowDown'?0:buttons.length-1):(index+(event.key==='ArrowDown'?1:buttons.length-1))%buttons.length].focus()}
 });
 document.addEventListener('keydown',event=>{if(!menu.hidden&&event.key==='Escape'){event.preventDefault();close()}});
 document.addEventListener('click',event=>{if(!menu.hidden&&!menu.contains(event.target)&&!trigger.contains(event.target))close()});
 document.addEventListener('air-settings-changed',()=>{if(!enabled())close();if(!menu.hidden)position();trigger.setAttribute('aria-expanded',String(!menu.hidden))});
 window.addEventListener('resize',()=>{if(!menu.hidden)position()});
 registry.onChange(()=>{if(!menu.hidden)render()});
 trigger.setAttribute('aria-controls','air-start-menu');trigger.setAttribute('aria-expanded','false');
 window.airStartMenu={enabled,toggle};
})();

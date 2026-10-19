'use strict';
(() => {
 const registry=window.airAppRegistry;if(!registry)return;
 registry.register('launchpad',{name:'Launchpad',iconClass:'launchpad-icon',glyph:'▦'});
 const kinds=['Alle','System','Produktivität','Medien & Web','Spiele'];
 const category=id=>['finder','downloads','trash','settings','about','launchpad'].includes(id)?'System':id==='arcade'?'Spiele':['airwrite','notes','calendar','mail','calculator','translator','ai','aircard'].includes(id)?'Produktivität':'Medien & Web';
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
})();

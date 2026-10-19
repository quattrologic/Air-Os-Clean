'use strict';
/* Air App Store: installs only the cryptographically verified bundled catalog. */
(() => {
 const registry=window.airAppRegistry;
 if(!registry)return;
 registry.register('store',{name:'Air App Store',iconClass:'store-icon',glyph:'▣'});
 vectorIcon.store='<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="airStoreB" x2="0" y2="1"><stop stop-color="#aee4ff"/><stop offset="1" stop-color="#408ee7"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="14" fill="url(#airStoreB)"/><path d="M15 24h34l-3 28H18Z" fill="#f9fcff"/><path d="M25 25v-6a7 7 0 0 1 14 0v6" fill="none" stroke="#f9fcff" stroke-width="4"/><path d="M27 38h10M32 33v10" stroke="#288edf" stroke-width="4" stroke-linecap="round"/></svg>';
 function body(){return '<section class="air-store"><header><div><small>AIR-OS · APP STORE</small><h2>Air App Store</h2><p>Geprüfte Apps aus dem lokalen Katalog.</p></div></header><div class="as-warning">Nur signierte Offline-Demopakete. Kein öffentlicher App-Marktplatz und keine Zahlungen.</div><div class="as-list" aria-live="polite">Katalog wird überprüft …</div><p class="as-status" role="status"></p></section>'}
 function mount(win){
  const root=win.querySelector('.air-store');if(!root||root.dataset.ready)return;root.dataset.ready='true';
  const list=root.querySelector('.as-list'),status=root.querySelector('.as-status'),api=window.airOS?.appStore;
  if(!api){list.textContent='Der App Store ist nur in der Air-OS Desktop-App verfügbar.';return}
  let busy=false;
  async function refresh(){
   try{
    const [catalog,installed]=await Promise.all([api.catalog(),api.installed()]);
    list.replaceChildren();
    for(const entry of catalog){
     const isInstalled=installed.some(a=>a.id===entry.id);
     const card=document.createElement('article');card.className='as-card';
     const icon=document.createElement('div');icon.className='as-icon';icon.textContent='⏱';
     const info=document.createElement('div');info.className='as-info';
     const name=document.createElement('h3');name.textContent=entry.name||'Air App';
     const description=document.createElement('p');description.textContent=entry.description||entry.error||'';
     const meta=document.createElement('small');meta.textContent=(entry.author||'Air-OS')+' · '+(entry.version||'Unbekannte Version')+' · Offline · Keine Berechtigungen';
     info.append(name,description,meta);card.append(icon,info);
     const actions=document.createElement('div');actions.className='as-actions';
     function button(text,handler,secondary=false){
      const b=document.createElement('button');b.type='button';b.textContent=text;if(secondary)b.className='as-secondary';
      b.disabled=!entry.compatible||busy;
      b.addEventListener('click',async()=>{if(busy)return;busy=true;status.textContent='Bitte warten …';try{await handler();status.textContent='Aktion erfolgreich.'}catch(error){status.textContent=error.message||'Aktion fehlgeschlagen.';console.error(error)}finally{busy=false;await refresh()}});actions.append(b);
     }
     if(isInstalled){button('Starten',()=>api.launch(entry.id));button('Deinstallieren',()=>api.remove(entry.id),true)}
     else button(entry.compatible?'Installieren':'Nicht verfügbar',()=>api.install(entry.id));
     card.append(actions);list.append(card);
    }
    if(!catalog.length)list.textContent='Zurzeit keine freigegebenen lokalen Apps verfügbar.';
   }catch(error){list.textContent='Katalogprüfung fehlgeschlagen.';status.textContent=error.message||String(error)}
  }
  refresh();
 }
 window.airAppStore={body,mount};if(typeof paintAppIcons==='function')paintAppIcons();
})();

'use strict';
// Shared real media and existing notification/window services. No store or engine.
(() => {
 const events=new AbortController(),signal=events.signal;let disposed=false,version=0;
 const controls=document.querySelector('#air-island-controls'),row=document.createElement('div');row.className='system-menu-actions';
 function action(id,text,fn){const b=document.createElement('button');b.type='button';b.id=id;b.textContent=text;b.onclick=fn;row.append(b);return b;}
 const switcher=action('system-app-switcher','Appwechsel',()=>window.airWindowSystem?.next());switcher.disabled=!window.airWindowSystem;
 const lock=action('system-lock','Air-OS sperren',()=>lockNow(false));lock.disabled=!window.airOS?.lock;
 const share=action('system-lock-share','Mit Medienvorschau sperren',()=>lockNow(true));share.disabled=true;
 (document.querySelector('#air-island-quick')||controls)?.append(row);row.classList.add('air-control-modern');
 // One shared transport drives the compact Island view; M1 shape/timeline unchanged.
 const quick=document.querySelector('#air-island-quick')||controls,media=document.createElement('section');media.className='system-now-playing air-control-modern';media.setAttribute('aria-label','Air Music Wiedergabe');const name=document.createElement('strong'),artist=document.createElement('p'),art=document.createElement('img');art.className='system-artwork';art.alt='Eingebettetes Albumcover';art.hidden=true;art.style.width='44px';art.style.height='44px';const buttons=document.createElement('div');buttons.className='system-transport';
 for(const [a,text]of [['previous','‹'],['toggle','▷'],['next','›']]){const b=document.createElement('button');b.type='button';b.dataset.systemMedia=a;b.textContent=text;b.setAttribute('aria-label',{previous:'Vorheriger Titel',toggle:'Play / Pause',next:'Nächster Titel'}[a]);b.onclick=()=>window.airMusic?.transport.act(a);buttons.append(b);}
 const progress=document.createElement('input');progress.type='range';progress.min=0;progress.max=1;progress.step=.001;progress.setAttribute('aria-label','Wiedergabeposition');progress.oninput=()=>window.airMusic?.transport.act('seek',Number(progress.value));
 const volume=document.createElement('input');volume.type='range';volume.min=0;volume.max=1;volume.step=.01;volume.setAttribute('aria-label','Air Music Lautstärke');volume.oninput=()=>window.airMusic?.transport.act('volume',Number(volume.value));buttons.append(progress,volume);media.append(art,name,artist,buttons);quick?.append(media);
 let lastArt='';function update(){if(disposed)return;const s=window.airMusic?.transport.snapshot()||{available:false};name.textContent=s.available?s.title:'Keine aktive Wiedergabe';artist.textContent=s.available?s.artist:'Lokale Musik in Air Music auswählen';share.disabled=!window.airOS?.lock||!s.available;for(const b of buttons.querySelectorAll('button')){b.disabled=!s.available||(b.dataset.systemMedia!=='toggle'&&s.count<2);if(b.dataset.systemMedia==='toggle')b.textContent=s.playing?'❚❚':'▷';}progress.disabled=!s.available||!s.duration;progress.value=s.duration?s.position/s.duration:0;volume.disabled=!s.available;volume.value=s.volume??.75;if(lastArt!==(s.artwork||'')){lastArt=s.artwork||'';art.hidden=!lastArt;if(lastArt)art.src=lastArt;else art.removeAttribute('src');}const count=window.airNotifications?.list().filter(n=>!n.read).length||0;const notices=document.querySelector('#system-control-notifications');if(notices)notices.textContent='Mitteilungen'+(count?' · '+count:'');}
 async function lockNow(release){if(disposed||!window.airOS?.lock)return;const request=++version;lock.disabled=share.disabled=true;try{const owner=(await airOS.currentUser())?.preferenceSession;if(!owner||disposed||request!==version)return;const preview=release?await window.airMusic.transport.preview():null;
  if(disposed||request!==version)return;await window.airWindowSystem?.flush();await airOS.lock(preview,owner);
 }catch{if(!disposed)toast('Air-OS konnte nicht gesperrt werden. Bitte erneut versuchen.');}finally{if(!disposed){lock.disabled=false;update();}}}
 document.addEventListener('air-music-changed',update,{signal});document.addEventListener('air-notifications-changed',update,{signal});update();
 function dispose(){disposed=true;version++;events.abort();row.remove();media.remove();art.removeAttribute('src');lastArt='';}
 document.addEventListener('air-profile-changing',dispose,{once:true});window.addEventListener('pagehide',dispose,{once:true});
})();

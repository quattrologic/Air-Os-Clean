'use strict';
if('serviceWorker' in navigator&&isSecureContext){
 const hadController=!!navigator.serviceWorker.controller;
 navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(reg=>{
  const offer=()=>{if(!reg.waiting)return;const button=document.createElement('button');button.className='pwa-update';button.textContent='Neue Offline-Version laden';button.onclick=()=>{if(!confirm('Ungespeicherte Eingaben vor dem Update sichern. Jetzt neu laden?'))return;document.dispatchEvent(new Event('air-profile-changing'));reg.waiting.postMessage('ACTIVATE');};document.body.append(button);};
  offer();reg.addEventListener('updatefound',()=>reg.installing?.addEventListener('statechange',offer));
  let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadController&&!refreshing){refreshing=true;location.replace('./');}});
 }).catch(()=>{const p=document.createElement('p');p.textContent='Offline-Installation fehlgeschlagen. Bitte online erneut öffnen.';document.body.append(p);});
}

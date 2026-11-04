'use strict';
// Only injected into the private-cloud artifact. Local data/identity never leave the device.
(()=>{
 let registration=null,job=null,checking=false,lastProbe=0;
 const status=document.createElement('p');status.setAttribute('role','status');status.dataset.cloudStatus='true';status.textContent='Privater Cloudzugang wird geprüft; Offlinebestand bleibt nutzbar.';
 const login=document.createElement('button');login.type='button';login.textContent='Cloudzugang anmelden / erneuern';
 const safe=()=>!document.hidden&&document.querySelector('#audio')?.paused&&!window.airDesktop?.dirty()&&!window.airTransfers?.busy();
 login.onclick=async()=>{if(!safe()){status.textContent='Vor Anmeldung Musik pausieren, Entwürfe speichern und Dateiübergaben abschließen.';return;}try{await window.airDesktop?.flush();if(safe())location.assign(new URL('./__air_access/login',location.href));}catch{status.textContent='Speichern nicht bestätigt. Anmeldung wurde nicht gestartet.';}};
 const mount=()=>{const panel=document.querySelector('[data-app=settings] .pad-window-content');if(panel&&!status.isConnected)panel.prepend(status,login);};
 async function probe(force=false){if(checking||document.hidden||!navigator.onLine||!force&&Date.now()-lastProbe<60000)return;checking=true;lastProbe=Date.now();try{const r=await fetch('./__air_access/status',{credentials:'same-origin',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(6000)});if(!r.ok||r.headers.get('content-type')?.split(';')[0]!=='application/json'||(await r.json()).authenticated!==true)throw Error();status.textContent='Privater Cloudzugang bestätigt. Freigegebene Updates werden sicher geprüft.';}catch{status.textContent='Cloudanmeldung oder Verbindung prüfen. Der vorhandene Offlinebestand bleibt erhalten.';}finally{checking=false;}}
 function attempt(){clearTimeout(job);job=setTimeout(async()=>{if(!registration?.waiting||!safe())return;try{await window.airDesktop?.flush();if(safe())registration.waiting?.postMessage({type:'REQUEST_SAFE_UPDATE',token:crypto.randomUUID()});}catch{status.textContent='Update wartet auf bestätigtes Speichern.';}},200);}
 navigator.serviceWorker?.ready.then(r=>{registration=r;r.addEventListener('updatefound',()=>r.installing?.addEventListener('statechange',attempt));attempt();});
 document.addEventListener('air-window-focused',mount);
 document.addEventListener('air-data-changed',e=>{if(e.detail!=='setting')attempt();});document.addEventListener('air-transfer-changed',attempt);
 document.querySelector('#audio')?.addEventListener('pause',attempt);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(job);else{void probe();attempt();}});
 window.addEventListener('online',()=>{void probe();attempt();});
 window.addEventListener('pagehide',()=>clearTimeout(job));
 document.querySelector('#check-update')?.addEventListener('click',()=>{void probe(true);attempt();});
 void probe();
})();

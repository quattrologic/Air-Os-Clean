'use strict';
// Optional cloud account lives inside existing Settings, never on the unauthenticated lockscreen.
window.airCloudUI={mount(win){
 const host=win.querySelector('.air-settings');if(!host||!window.airOS?.cloud)return;
 const section=document.createElement('section');section.className='air-cloud-panel';section.innerHTML='<h3>Air Cloud · Notizen</h3><p>Freiwillig: Dieses lokale Profil mit einem vorhandenen Cloud-Konto verknüpfen. Abgleich beim Öffnen, nach Speicherung und über „Synchronisieren“. Konflikte stoppen den Abgleich.</p><form><label>Cloud-E-Mail <input type="email" name="email" autocomplete="username" required></label><label>Cloud-Passwort <input type="password" name="password" autocomplete="current-password" required></label><button type="submit">Cloud-Konto verknüpfen</button></form><button type="button" data-sync>Synchronisieren</button><button type="button" data-logout>Cloud abmelden</button><p role="status"></p>';
 for(const button of section.querySelectorAll('button'))button.className='secondary-button';
 host.append(section);const form=section.querySelector('form'),status=section.querySelector('[role=status]');
 let disposed=false;const owner=window.airOS.currentUser();
 const alive=async()=>!disposed&&win.isConnected&&(await owner)?.preferenceSession===(await window.airOS.currentUser())?.preferenceSession;
 async function run(action,input){
  try{if(!await alive())return;const result=await window.airOS.cloud[action](input);if(!await alive())return;
   status.textContent=result.ok?(result.warning||result.error||(!result.configured&&action==='status'?'Cloud-Backend noch nicht eingerichtet.':'Cloud: '+(result.signedIn?'angemeldet':result.linked?'verknüpft, abgemeldet':'nicht verknüpft')+(result.lastSync?' · Abgleich '+new Date(result.lastSync).toLocaleString():''))):result.error;
   if(action==='signIn'&&result.ok){await run('sync');return;}
   if(action==='sync'&&result.ok)document.dispatchEvent(new Event('air-notes-changed'));
  }catch{if(!disposed)status.textContent='Cloud-Aktion fehlgeschlagen. Lokale Notizen bleiben erhalten.';}
 }
 form.addEventListener('submit',e=>{e.preventDefault();const email=form.elements.email.value,password=form.elements.password.value;form.elements.password.value='';void run('signIn',{email,password});});
 section.querySelector('[data-sync]').onclick=()=>run('sync');section.querySelector('[data-logout]').onclick=()=>run('signOut');
 function dispose(){disposed=true;form.elements.password.value='';document.removeEventListener('air-profile-changing',dispose);window.removeEventListener('pagehide',dispose);win.querySelector('.close')?.removeEventListener('click',dispose,true);}
 document.addEventListener('air-profile-changing',dispose);window.addEventListener('pagehide',dispose);win.querySelector('.close')?.addEventListener('click',dispose,true);void run('status');
}};
// Event-driven, no polling. Failed/overlapping syncs leave local CRUD available.
(() => {
 let busy=false,again=false,disposed=false;
 async function sync(){
  if(disposed)return;if(busy){again=true;return;}busy=true;
  try{const owner=await window.airOS?.currentUser(),s=await window.airOS?.cloud?.status();
   if(!s?.signedIn||disposed)return;const result=await window.airOS.cloud.sync();
   if(!disposed&&result.ok&&owner?.preferenceSession===(await window.airOS.currentUser())?.preferenceSession)document.dispatchEvent(new Event('air-notes-changed'));
  }catch{ /* Manual Settings sync provides errors and retry. Local saves remain acknowledged. */ }
  finally{busy=false;if(again&&!disposed){again=false;void sync();}}
 }
 for(const type of ['air-notes-saved','air-notes-deleted'])document.addEventListener(type,sync);
 window.addEventListener('online',sync);window.addEventListener('pagehide',()=>{disposed=true;});document.addEventListener('air-profile-changing',()=>{disposed=true;});
 void sync();
})();

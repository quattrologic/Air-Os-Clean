'use strict';
// Local screen only: no passwords, account creation, system lock or cloud login.
document.body.classList.remove('maclock-motion-pending');
const mark=document.createElement('img');mark.src='assets/brand/air-os-white.svg';mark.alt='Air-OS';mark.width=40;mark.height=40;document.querySelector('#login-avatar').replaceChildren(mark);
const form=document.querySelector('#login-form');form.replaceChildren();
const label=document.createElement('h1');label.textContent='Air-OS · lokal';
const hint=document.createElement('p');hint.textContent='Offline-Browsermodus · keine sichere Anmeldung. Daten bleiben in diesem Browser. Auf fremden Geräten nur Testnotizen verwenden.';
const enter=document.createElement('button');enter.type='button';enter.id='pwa-enter';enter.textContent='Lokal öffnen';enter.onclick=()=>{sessionStorage.setItem('air-pwa-session',crypto.randomUUID());location.assign('desktop.html');};form.append(label,hint,enter);
for(const sel of ['#create-form','#switch-create','.power-controls','#sleep-overlay','#maclock-reduce-glass'])document.querySelector(sel)?.remove();
document.querySelector('.maclock-scope').textContent='Lokaler Browsermodus · keine Betriebssystemsperre · Cloud deaktiviert';
const update=()=>{const now=new Date();document.querySelector('#login-clock').textContent=now.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});const d=document.querySelector('#maclock-date');if(d)d.textContent=now.toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long'});};update();const timer=setInterval(update,1000);window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});

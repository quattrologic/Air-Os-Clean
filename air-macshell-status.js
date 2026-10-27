'use strict';
(()=>{const events=new AbortController(),signal=events.signal;let disposed=false,timer=null,observer=null;const buttons=[];
 function icon(b,kind){const canvas=document.createElement('canvas');canvas.width=canvas.height=36;canvas.style.width=canvas.style.height='18px';canvas.setAttribute('aria-hidden','true');airWGlyphs.draw(canvas.getContext('2d'),kind,'#f5f5f7',36);b.replaceChildren(canvas);}
 function setup(){const host=document.querySelector('.t6-status');if(!host)return;observer?.disconnect();
  const focus=document.createElement('button');focus.id='t7-focus-status';focus.type='button';focus.title='Air-OS Fokus · nur eigene Mitteilungen';focus.setAttribute('aria-label',focus.title);icon(focus,'moon');focus.onclick=()=>window.airFocusMode?.set?.(!window.airFocusMode.active);
  const media=document.createElement('button');media.id='t7-media-status';media.type='button';media.setAttribute('aria-label','Air Music Steuerung');icon(media,'speaker');media.onclick=()=>{const t=document.querySelector('#air-island-toggle');if(t.getAttribute('aria-expanded')!=='true')t.click();document.querySelector('#air-island-view-quick')?.click();};
  const date=document.createElement('button');date.id='t7-date-status';date.type='button';date.setAttribute('aria-label','Datum und Kalender');date.onclick=()=>window.airCalendar?.open(date);host.prepend(focus,media,date);buttons.push(focus,media,date);
  function update(){if(disposed)return;focus.disabled=!window.airFocusMode?.set;focus.setAttribute('aria-pressed',String(!!window.airFocusMode?.active));media.disabled=!window.airMusic?.transport.snapshot().available;date.textContent=new Date().toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short'});}
  document.addEventListener('air-focus-changed',update,{signal});document.addEventListener('air-music-changed',update,{signal});window.addEventListener('focus',update,{signal});document.addEventListener('visibilitychange',update,{signal});
  function midnight(){update();const n=new Date(),next=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1);timer=setTimeout(midnight,Math.max(1000,next-n+100));}midnight();
 }
 if(document.querySelector('.t6-status'))setup();else{observer=new MutationObserver(setup);observer.observe(document.body,{childList:true,subtree:true});}
 const end=()=>{disposed=true;observer?.disconnect();events.abort();clearTimeout(timer);buttons.forEach(b=>b.remove());};document.addEventListener('air-profile-changing',end,{once:true});window.addEventListener('pagehide',end,{once:true});})();

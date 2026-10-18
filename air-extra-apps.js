/* Air-OS additions: calculator, translator, local AI. No secrets embedded. */
(function(){
const $=(s,r=document)=>r.querySelector(s);
const safe=(v)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={
 translator:'<svg viewBox="0 0 64 64"><defs><linearGradient id="trg" x2="0" y2="1"><stop stop-color="#70d5ff"/><stop offset="1" stop-color="#2274d5"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="14" fill="url(#trg)"/><path d="M12 15h25v24H12z" fill="#fff" opacity=".94"/><path d="M25 23h22v25H25z" fill="#eaf8ff" stroke="#fff" stroke-width="2"/><text x="24" y="32" text-anchor="middle" font-size="16" font-weight="bold" fill="#2863aa">A</text><text x="36" y="42" text-anchor="middle" font-size="15" font-weight="bold" fill="#2870c0">文</text></svg>',
 ai:'<svg viewBox="0 0 64 64"><defs><linearGradient id="aig" x2="0" y2="1"><stop stop-color="#bca5ff"/><stop offset="1" stop-color="#6257d9"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="14" fill="url(#aig)"/><path d="M17 20q0-7 8-7h14q8 0 8 7v21q0 7-8 7H29l-10 7v-9q-2-2-2-5Z" fill="#fff" opacity=".94"/><path d="m32 20 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#7a6cdd"/></svg>',
 arcade:'<svg viewBox="0 0 64 64"><defs><linearGradient id="arg" x2="0" y2="1"><stop stop-color="#80edb7"/><stop offset="1" stop-color="#168e89"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="14" fill="url(#arg)"/><path d="M16 27q2-7 9-7h14q7 0 9 7l5 15q2 9-6 9-4 0-9-8H26q-5 8-9 8-8 0-6-9Z" fill="#f8fdff" stroke="#c7e9e5" stroke-width="1.4"/><path d="M24 28v13M18 34h12" stroke="#258a8c" stroke-width="3.5" stroke-linecap="round"/><circle cx="40" cy="31" r="3" fill="#f17b8a"/><circle cx="46" cy="37" r="3" fill="#f6c35a"/></svg>'
};
function body(id){
 if(id==='translator')return '<div class="air-new-app"><h2>Air-Übersetzer</h2><p>Online-Übersetzung über MyMemory. Eingegebener Text wird an den externen Dienst gesendet.</p><div class="air-translate-langs"><select id="air-from" aria-label="Ausgangssprache"><option value="de">Deutsch</option><option value="en">Englisch</option><option value="fr">Französisch</option><option value="es">Spanisch</option><option value="it">Italienisch</option></select><button id="air-swap" type="button" title="Sprachen tauschen">⇄</button><select id="air-to" aria-label="Zielsprache"><option value="en">Englisch</option><option value="de">Deutsch</option><option value="fr">Französisch</option><option value="es">Spanisch</option><option value="it">Italienisch</option></select></div><div class="air-translate-cols"><textarea id="air-translate-input" maxlength="450" placeholder="Text eingeben …"></textarea><textarea id="air-translate-output" readonly placeholder="Übersetzung erscheint hier …"></textarea></div><div class="air-new-actions"><button id="air-translate-run" class="primary-button">Übersetzen</button><button id="air-translate-copy">Kopieren</button><span id="air-translate-status" role="status"></span></div></div>';
 if(id==='ai')return '<div class="air-new-app air-ai-app"><h2>Air-KI</h2><p>Lokaler Chat mit Ollama. Keine Cloud-Schlüssel nötig. Ollama muss auf diesem Computer laufen.</p><div class="air-ai-controls"><label>Modell <input id="air-ai-model" value="llama3.2" spellcheck="false" aria-label="Ollama-Modell"></label><button id="air-ai-new">Neuer Chat</button></div><div id="air-ai-messages" class="air-ai-messages" aria-live="polite"></div><form id="air-ai-form" class="air-ai-form"><textarea id="air-ai-prompt" rows="2" maxlength="12000" placeholder="Frage stellen …"></textarea><button class="primary-button" type="submit">Senden</button></form><div id="air-ai-status" role="status">Verbindung: http://127.0.0.1:11434 · Chatverlauf nur lokal.</div></div>';
 return '';
}
function mount(id,win){
 if(id==='calculator'){
  const display=$('#calc-display',win),keys=$('.calc-keys',win);if(!display||!keys)return;
  let expr='',history=[];
  const hist=document.createElement('div');hist.className='air-calc-history';hist.setAttribute('aria-live','polite');keys.after(hist);
  for(const k of ['(',')','%','.','⌫']){const b=document.createElement('button');b.textContent=k;b.dataset.key=k;keys.appendChild(b)}
  const handle=k=>{
   if(k==='C'){expr='';display.textContent='0';return}
   if(k==='⌫'){expr=expr.slice(0,-1);display.textContent=expr||'0';return}
   if(k==='='){
    try{const normalized=expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/(\\d+(?:\\.\\d+)?)%/g,'($1/100)');const val=calcEvaluate(normalized);history.unshift(expr+' = '+val);history=history.slice(0,5);hist.textContent=history.join('  ·  ');expr=String(val);display.textContent=expr}catch{display.textContent='Fehler';expr=''}return;
   }
   if(/^[0-9.+−×÷()%]$/.test(k)){expr+=k;display.textContent=expr}
  };
  keys.addEventListener('click',e=>{const b=e.target.closest('[data-key]');if(b){e.stopImmediatePropagation();handle(b.dataset.key)}},true);
  win.addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;const map={'*':'×','/':'÷','-':'−',Enter:'=',Backspace:'⌫',Escape:'C'};const k=map[e.key]||e.key;if(/^[0-9.+−×÷()%]$/.test(k)||['=','⌫','C'].includes(k)){e.preventDefault();handle(k)}});
 }
 if(id==='translator'){
  const from=$('#air-from',win),to=$('#air-to',win),input=$('#air-translate-input',win),output=$('#air-translate-output',win),status=$('#air-translate-status',win),run=$('#air-translate-run',win);
  $('#air-swap',win).onclick=()=>{const x=from.value;from.value=to.value;to.value=x;input.value=output.value;output.value=''};
  $('#air-translate-copy',win).onclick=()=>{if(output.value)navigator.clipboard?.writeText(output.value).then(()=>status.textContent='Kopiert').catch(()=>status.textContent='Kopieren nicht möglich')};
  run.onclick=async()=>{const text=input.value.trim();if(!text)return;if(from.value===to.value){output.value=text;return}run.disabled=true;status.textContent='Übersetze …';try{const url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair='+encodeURIComponent(from.value+'|'+to.value);const response=await fetch(url);if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();if(!data.responseData?.translatedText)throw Error('Keine Übersetzung');output.value=data.responseData.translatedText;status.textContent='Fertig · externer Übersetzungsdienst'}catch(e){status.textContent='Übersetzung nicht verfügbar: '+e.message}finally{run.disabled=false}};
 }
 if(id==='ai'){
  let messages=[];const log=$('#air-ai-messages',win),status=$('#air-ai-status',win),prompt=$('#air-ai-prompt',win),form=$('#air-ai-form',win);
  const render=()=>{log.replaceChildren();for(const m of messages){const el=document.createElement('div');el.className='air-ai-bubble '+(m.role==='user'?'user':'assistant');el.textContent=m.content;log.appendChild(el)}log.scrollTop=log.scrollHeight};
  $('#air-ai-new',win).onclick=()=>{messages=[];render();status.textContent='Neuer lokaler Chat'};
  form.onsubmit=async e=>{e.preventDefault();const value=prompt.value.trim();if(!value)return;const model=$('#air-ai-model',win).value.trim();if(!/^[a-zA-Z0-9_.:\\/-]{1,100}$/.test(model)){status.textContent='Ungültiger Modellname';return}messages.push({role:'user',content:value});prompt.value='';render();const button=form.querySelector('button');button.disabled=true;status.textContent='Ollama antwortet …';try{const response=await fetch('http://127.0.0.1:11434/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,messages,stream:false})});if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();const answer=data.message?.content;if(typeof answer!=='string')throw Error('Ungültige Antwort');messages.push({role:'assistant',content:answer});render();status.textContent='Lokal beantwortet'}catch(err){status.textContent='Ollama nicht erreichbar. Installieren, starten und Modell laden (ollama pull '+model+'). '+err.message}finally{button.disabled=false}};
 }
}
window.airExtraApps={body,mount,icons};
if(typeof vectorIcon!=="undefined"){Object.assign(vectorIcon,icons);if(typeof paintAppIcons==="function")paintAppIcons();}
document.querySelectorAll(".arcade-icon").forEach(el=>el.innerHTML=icons.arcade);
})();

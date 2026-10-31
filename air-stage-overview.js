'use strict';
// Independent presentation adapter. openApps, lifecycle, windowSystem and M2 own windows.
(()=>{
 const system=window.airWindowSystem,math=window.airStageMath;if(!system||!math)return;
 const events=new AbortController(),signal=events.signal,rail=document.createElement('nav');
 rail.className='origin-stage-rail';rail.setAttribute('aria-label','Air-OS Stages');document.body.append(rail);
 let panel=null,opener=null,drag=null,disposed=false,busy=false,frame=0,stamp='',chosen=new Set();
 const reduced=()=>readAirSettings().reduceMotion||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const allowed=()=>!disposed&&document.documentElement.dataset.desktopTheme==='modern'&&!document.documentElement.classList.contains('air-native-fullscreen');
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const button=(text,fn)=>{const n=el('button',text);n.type='button';n.onclick=fn;return n;};
 const name=id=>airAppRegistry.get(id)?.name||id;
 function cancelDrag(){if(!drag)return;try{drag.target.releasePointerCapture(drag.pointer);}catch{}drag.target.classList.remove('origin-stage-dragging');drag=null;}
 function motion(node){if(reduced())return;const a=node.animate([{opacity:0,translate:'0 10px'},{opacity:1,translate:'0 0'}],{duration:180,easing:'cubic-bezier(.2,.65,.3,1)'});a.finished.catch(()=>{});}
 function close(focus=true){cancelDrag();if(frame)cancelAnimationFrame(frame);frame=0;if(!panel)return;for(const a of panel.getAnimations({subtree:true}))a.cancel();panel.remove();panel=null;chosen.clear();stamp='';if(focus&&opener?.isConnected)opener.focus({preventScroll:true});opener=null;}
 async function save(patch){if(busy||!allowed())return false;busy=true;try{return await system.stageSettings(patch);}finally{busy=false;if(!disposed){stamp='';sync();}}}
 function activate(group,id=group.apps[0]){close(false);system.focus(id);}
 function preview(group){const area=appWindowHostRect(),art=el('div');art.className='origin-stage-preview';art.setAttribute('aria-hidden','true');
  for(const id of group.apps){const w=openApps.get(id);if(!w)continue;const mini=el('span'),icon=el('span'),b=math.miniature({left:parseFloat(w.style.left)||0,top:parseFloat(w.style.top)||0,width:w.offsetWidth||320,height:w.offsetHeight||220},area);mini.className='origin-stage-mini';for(const [key,value]of Object.entries(b))mini.style[key]=value+'px';paintAirAppIcon(icon,id);mini.append(icon);art.append(mini);}return art;
 }
 function move(id,delta){const list=system.stages().map(g=>g.id),i=list.indexOf(id),j=i+delta;if(i<0||j<0||j>=list.length)return;[list[i],list[j]]=[list[j],list[i]];void save({order:list});}
 function pointerStart(e,card,id){if(e.button!==0||e.isPrimary===false||e.target.closest('button,input,select'))return;cancelDrag();drag={id,pointer:e.pointerId,x:e.clientX,y:e.clientY,target:card,moved:false};card.setPointerCapture(e.pointerId);}
 function paintPanel(){if(!panel)return;const focused=document.activeElement?.dataset.stageFocus;cancelDrag();panel.replaceChildren();
  const header=el('header'),title=el('h2','Stage-Übersicht'),exit=button('Schließen',()=>close());exit.dataset.stageFocus='close';header.append(title,exit);panel.append(header);
  const row=el('div'),toggle=button(system.stageSnapshot().enabled?'Stage-Modus ausschalten':'Stage-Modus einschalten',()=>save({enabled:!system.stageSnapshot().enabled}));toggle.id='origin-stage-toggle';toggle.setAttribute('aria-pressed',String(system.stageSnapshot().enabled));
  const create=button('Auswahl gruppieren',()=>{const prefs=system.stageSnapshot(),ids=[...chosen].filter(id=>openApps.has(id));if(ids.length<2)return;const groups=prefs.groups.map(g=>({...g,apps:g.apps.filter(id=>!ids.includes(id))})).filter(g=>g.apps.length>=2);groups.push({id:'g-'+crypto.randomUUID(),apps:ids});chosen.clear();void save({groups,order:[]});});create.disabled=chosen.size<2;create.id='origin-stage-group';
  const ws=el('select');ws.setAttribute('aria-label','Arbeitsbereich');for(let n=1;n<=4;n++){const option=el('option','Arbeitsbereich '+n);option.value=n;ws.append(option);}ws.value=system.desktopLayout().workspace;ws.onchange=()=>{cancelDrag();void system.configure({workspace:Number(ws.value)});};row.append(toggle,create,ws);panel.append(row);
  const help=el('p','Fenster wählen und gruppieren. Gruppen am Rand ziehen; Strg+Pfeil links/rechts sortiert. Vorschauen zeigen Geometrien, keine Fensterinhalte.');help.className='origin-stage-help';panel.append(help);
  const list=el('div');list.className='origin-stage-grid';panel.append(list);const groups=system.stages();
  if(!groups.length)list.append(el('p','Noch keine geöffneten Fenster in diesem Arbeitsbereich.'));
  for(const group of groups){const card=el('section');card.className='origin-stage-card';card.tabIndex=0;card.dataset.stage=group.id;card.dataset.stageFocus=group.id;card.setAttribute('aria-label',group.apps.map(name).join(', '));card.onpointerdown=e=>pointerStart(e,card,group.id);card.onkeydown=e=>{if(e.ctrlKey&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(group.id,e.key==='ArrowLeft'?-1:1);}else if(e.key==='Enter'&&e.target===card){e.preventDefault();activate(group);}};
   card.append(preview(group));for(const id of group.apps){const line=el('label'),check=el('input');check.type='checkbox';check.checked=chosen.has(id);check.setAttribute('aria-label',name(id)+' zum Gruppieren auswählen');check.onchange=()=>{check.checked?chosen.add(id):chosen.delete(id);create.disabled=chosen.size<2;};line.append(check,el('span',name(id)));card.append(line);const open=button(airAppLifecycle.get(id)==='minimized'?'Wiederherstellen':'Fenster öffnen',()=>activate(group,id));open.dataset.stageApp=id;card.append(open);}
   const actions=el('div');actions.className='origin-stage-actions';actions.append(button('←',()=>move(group.id,-1)),button('→',()=>move(group.id,1)));actions.children[0].setAttribute('aria-label','Stage nach links');actions.children[1].setAttribute('aria-label','Stage nach rechts');if(group.apps.length>1)actions.append(button('Gruppe lösen',()=>save({groups:system.stageSnapshot().groups.filter(g=>g.id!==group.id),order:[]})));card.append(actions);list.append(card);
  }
  if(focused)panel.querySelector(`[data-stage-focus="${CSS.escape(focused)}"]`)?.focus({preventScroll:true});
 }
 function sync(){if(disposed)return;if(!allowed()){close();rail.hidden=true;return;}const groups=system.stages(),state=system.stageSnapshot(),key=JSON.stringify([state,groups,airAppLifecycle.focused(),[...openApps.keys()].map(id=>[id,airAppLifecycle.get(id)])]);rail.hidden=!state.enabled;
  if(key===stamp)return;stamp=key;rail.replaceChildren();if(state.enabled){for(const group of groups){const b=button('',()=>activate(group));b.setAttribute('aria-label',group.apps.map(name).join(', '));b.setAttribute('aria-current',String(group.apps.includes(airAppLifecycle.focused())));for(const id of group.apps){const icon=el('span');paintAirAppIcon(icon,id);b.append(icon);}rail.append(b);}rail.append(button('Übersicht',()=>open()));}if(panel)paintPanel();
 }
 function open(){if(!allowed())return false;close(false);opener=document.activeElement;panel=el('section');panel.className='origin-stage-overview';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Stage-Übersicht');document.body.append(panel);paintPanel();panel.querySelector('button')?.focus();motion(panel);return true;}
 document.addEventListener('keydown',e=>{if(e.isComposing)return;if(e.ctrlKey&&e.altKey&&e.code==='KeyS'&&!document.querySelector('dialog[open]')){e.preventDefault();panel?close():open();return;}if(!panel)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}else if(e.key==='Tab'){const items=[...panel.querySelectorAll('button:not(:disabled),input,select,[tabindex="0"]')],i=items.indexOf(document.activeElement);e.preventDefault();items[(i+(e.shiftKey?items.length-1:1))%items.length]?.focus();}},{capture:true,signal});
 document.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointer)return;const moved=Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8;if(moved){drag.moved=true;drag.target.classList.add('origin-stage-dragging');}},{signal,passive:true});
 document.addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.pointer)return;const d=drag,target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-stage]');cancelDrag();if(d.moved&&target&&target.dataset.stage!==d.id)void save({order:math.move(system.stages().map(g=>g.id),d.id,target.dataset.stage)});},{signal});
 document.addEventListener('pointercancel',cancelDrag,{signal});document.addEventListener('pointerdown',e=>{if(panel&&!panel.contains(e.target)&&!e.target.closest('.t6-menu-popup'))close();},{signal});
 window.addEventListener('resize',()=>{cancelDrag();if(panel)paintPanel();},{signal});window.addEventListener('blur',()=>{cancelDrag();},{signal});document.addEventListener('visibilitychange',()=>{if(document.hidden)close(false);},{signal});document.addEventListener('air-settings-changed',()=>{stamp='';sync();},{signal});
 const stop=airAppLifecycle.onChange(()=>{if(!frame&&!disposed)frame=requestAnimationFrame(()=>{frame=0;sync();});});
 function end(){if(disposed)return;close(false);disposed=true;stop();events.abort();rail.remove();chosen.clear();}
 document.addEventListener('air-profile-changing',end,{once:true});window.addEventListener('pagehide',end,{once:true});
 window.airStageOverview=Object.freeze({open,close,sync,snapshot:()=>({open:!!panel,dragging:!!drag,pending:!!frame,disposed})});sync();
})();

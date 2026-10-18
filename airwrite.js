'use strict';
(function(){
const body=()=>`<div class="airwrite"><div class="airwrite-tools"><button data-aw="new">Neues Blatt</button><button data-aw="pen" aria-pressed="true">✎ Stift</button><button data-aw="eraser" aria-pressed="false">Radierer</button><label>Farbe <input data-aw="color" type="color" value="#1b2840"></label><label>Stärke <input data-aw="width" type="range" min="1" max="18" value="3"></label><button data-aw="undo">↶ Rückgängig</button><button data-aw="clear">Leeren</button><button data-aw="export">JSON exportieren</button></div><div class="airwrite-sheet"><canvas aria-label="Handschriftfläche"></canvas></div><div class="airwrite-foot"><span data-aw="status">Lokal gespeichert · Cloud-Sync aus</span><span>Mit Maus, Touch oder Stift schreiben</span></div></div>`;
function init(win){
 const root=win.querySelector('.airwrite'),canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d');
 let strokes=[],current=null,eraser=false,color='#1b2840',width=3,key='air-os-airwrite-local',ready=false;
 const status=root.querySelector('[data-aw="status"]');
 const get=(name)=>root.querySelector('[data-aw="'+name+'"]');
 const save=()=>{if(!ready)return;try{localStorage.setItem(key,JSON.stringify({version:1,strokes,updatedAt:new Date().toISOString()}));status.textContent='Lokal gespeichert · Cloud-Sync aus';}catch{status.textContent='Speicher voll – bitte JSON exportieren';}};
 const drawStroke=s=>{if(!s.points.length)return;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=s.color;ctx.lineWidth=s.width;ctx.beginPath();s.points.forEach((p,i)=>{if(i===0)ctx.moveTo(p.x*canvas.width,p.y*canvas.height);else ctx.lineTo(p.x*canvas.width,p.y*canvas.height);});if(s.points.length===1){let p=s.points[0];ctx.lineTo(p.x*canvas.width+.1,p.y*canvas.height+.1);}ctx.stroke();};
 const redraw=()=>{ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);strokes.forEach(drawStroke);if(current)drawStroke(current);};
 const resize=()=>{const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;canvas.width=Math.max(1,Math.round(r.width));canvas.height=Math.max(1,Math.round(r.height));redraw();};
 const point=e=>{const r=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))};};
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;canvas.setPointerCapture(e.pointerId);const p=point(e);if(eraser){let best=-1,dist=.035;strokes.forEach((s,i)=>s.points.forEach(q=>{const d=Math.hypot((q.x-p.x)*canvas.width,(q.y-p.y)*canvas.height)/Math.min(canvas.width,canvas.height);if(d<dist){dist=d;best=i;}}));if(best>=0){strokes.splice(best,1);save();redraw();}return;}current={color,width,points:[p]};redraw();});
 canvas.addEventListener('pointermove',e=>{if(!current||!canvas.hasPointerCapture(e.pointerId))return;current.points.push(point(e));redraw();});
 const finish=()=>{if(current){strokes.push(current);current=null;save();redraw();}};
 canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);canvas.addEventListener('lostpointercapture',finish);
 get('pen').onclick=()=>{eraser=false;get('pen').setAttribute('aria-pressed','true');get('eraser').setAttribute('aria-pressed','false');};
 get('eraser').onclick=()=>{eraser=true;get('pen').setAttribute('aria-pressed','false');get('eraser').setAttribute('aria-pressed','true');};
 get('color').oninput=e=>color=e.target.value;get('width').oninput=e=>width=Number(e.target.value);
 get('undo').onclick=()=>{strokes.pop();save();redraw();};
 get('clear').onclick=()=>{if(confirm('Dieses Blatt wirklich leeren?')){strokes=[];save();redraw();}};
 get('new').onclick=()=>{if(confirm('Neues Blatt beginnen? Das aktuelle Blatt wird ersetzt.')){strokes=[];save();redraw();}};
 get('export').onclick=()=>{const data=JSON.stringify({version:1,strokes,updatedAt:new Date().toISOString()},null,2);const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='AirWrite-Handschrift.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 const observer=new ResizeObserver(resize);observer.observe(canvas);const cleanup=new MutationObserver(()=>{if(!win.isConnected){observer.disconnect();cleanup.disconnect();}});cleanup.observe(document.querySelector('#windows'),{childList:true});
 Promise.resolve(window.airOS?.currentUser?.()).then(user=>{key='air-os-airwrite-v1-'+(user?.username||'local');try{const raw=JSON.parse(localStorage.getItem(key)||'null');if(raw?.version===1&&Array.isArray(raw.strokes)){strokes=raw.strokes.filter(s=>s&&Array.isArray(s.points)&&s.points.length<=10000&&typeof s.color==='string'&&Number.isFinite(s.width)).slice(0,2000);}}catch{}ready=true;resize();}).catch(()=>{ready=true;resize();});
}
window.airWriteApp={body,init};
})();

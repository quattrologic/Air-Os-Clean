'use strict';
// One bounded presentation owner. No window/geometry or data ownership; no idle RAF.
(()=>{const active=new Map(),reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('pad-reduced-motion');
 const curves={open:'cubic-bezier(.34,1.56,.64,1)',panel:'cubic-bezier(.16,1,.3,1)'};
 function cancel(node){const a=active.get(node);if(a){active.delete(node);a.cancel();}}
 function show(node,kind='panel'){cancel(node);if(!node?.isConnected||document.hidden||reduced()||!node.animate)return;
 // Adapted InfinityOS winOpen: same overshoot curve, shorter travel and scale for touch.
 const frames=kind==='window'?[{opacity:0,transform:'translateY(8px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}]:[{opacity:0},{opacity:1}];
 const a=node.animate(frames,{duration:kind==='window'?250:180,easing:curves[kind==='window'?'open':'panel']});active.set(node,a);a.finished.catch(()=>{}).finally(()=>{if(active.get(node)===a)active.delete(node);});}
 function clear(){for(const node of active.keys())cancel(node);}
 const observer=new MutationObserver(()=>{if(reduced())clear();});observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});window.addEventListener('pagehide',e=>{clear();if(!e.persisted)observer.disconnect();});
 document.addEventListener('air-ipad-session',e=>show(document.querySelector(e.detail?'#desktop':'#lockscreen')));
 const notch=document.querySelector('#notch-panel');if(notch){const watch=new MutationObserver(()=>{if(!notch.hidden)show(notch);else cancel(notch);});watch.observe(notch,{attributes:true,attributeFilter:['hidden']});window.addEventListener('pagehide',e=>{if(!e.persisted)watch.disconnect();});}
 window.airVisualMotion=Object.freeze({show,cancel,snapshot:()=>({active:active.size,reduced:reduced()})});})();

'use strict';
// Only constrain the focused PWA editor when the visual viewport shrinks.
// Dock/Island and desktop window geometry are never resized here.
(() => {
 const viewport=window.visualViewport;if(!viewport)return;
 let previous=null;
 function update(){
  const field=document.activeElement,editor=field?.closest?.('.note-workspace');
  if(previous&&previous!==editor){previous.style.removeProperty('max-height');previous.style.removeProperty('overflow-y');previous=null;}
  if(editor&&viewport.height<innerHeight-120){
   const rect=editor.getBoundingClientRect(),available=Math.max(120,viewport.offsetTop+viewport.height-rect.top-16);
   editor.style.maxHeight=available+'px';editor.style.overflowY='auto';previous=editor;
   field.scrollIntoView({block:'nearest',behavior:'auto'});
  }else if(previous){previous.style.removeProperty('max-height');previous.style.removeProperty('overflow-y');previous=null;}
 }
 viewport.addEventListener('resize',update);document.addEventListener('focusin',update);document.addEventListener('focusout',update);
 window.addEventListener('pagehide',()=>{viewport.removeEventListener('resize',update);document.removeEventListener('focusin',update);document.removeEventListener('focusout',update);},{once:true});
})();

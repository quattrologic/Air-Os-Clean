'use strict';
// State tracking for trusted built-in apps; not an IPC or security boundary.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.airAppLifecycle=api;
})(typeof window!=='undefined'?window:null,function(){
 const states=new Map(),listeners=new Set();
 let focusedApp=null;
 const VALID=new Set(['running','focused','minimized','maximized','closed']);
 function get(id){return states.get(id)||'closed'}
 function list(){return Object.freeze(Array.from(states,([id,state])=>Object.freeze({id,state})))}
 function onChange(fn){if(typeof fn!=='function')throw new TypeError('Listener must be a function.');listeners.add(fn);return()=>listeners.delete(fn)}
 function transition(id,state){
  if(typeof id!=='string'||!/^[a-z][a-z0-9-]{0,63}$/.test(id))throw new TypeError('Invalid app ID.');
  if(!VALID.has(state))throw new TypeError('Unknown lifecycle state.');
  const previous=get(id);if(state==='closed')states.delete(id);else states.set(id,state);
  // Per-app state can still say focused after another window takes focus.
  // Reacquiring focus must notify observers; focusing the current app is a no-op.
  const takesFocus=state==='focused'||state==='maximized';
  const focusChanged=takesFocus&&focusedApp!==id;
  if(takesFocus)focusedApp=id;
  else if(focusedApp===id)focusedApp=null;
  if(previous===state&&!focusChanged)return false;
  const event=Object.freeze({id,previous,state});
  for(const fn of Array.from(listeners)){try{fn(event)}catch(error){if(typeof console!=='undefined')console.error('Lifecycle observer error:',error)}}
  return true;
 }
 return Object.freeze({get,list,transition,onChange,focused:()=>focusedApp});
});

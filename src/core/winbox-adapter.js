/* WinBox evaluation bridge. No production registry, DOM, M2 or lifecycle takeover. */
(function(root){
 function preflight(node,{registered=false,m2=false}={}){
  const blockers=[];
  if(registered||node?.closest?.('.app-window'))blockers.push('active-air-os-dom-owner');
  if(m2||node?._airOSDockMotion)blockers.push('m2-owns-transform-display-and-completion');
  return {accepted:blockers.length===0,blockers};
 }
 function create({WinBox,root:host,mount,onFocus=()=>{}}){
  const check=preflight(mount);if(!check.accepted)throw Error(check.blockers.join(','));
  if(!host||!mount||typeof WinBox!=='function')throw TypeError('Explicit detached evaluation root and mount required');
  let ended=false;
  const engine=new WinBox({root:host,mount,title:'Air-OS · WinBox evaluation',width:600,height:400,x:20,y:20,onfocus:()=>{if(!ended)onFocus();},class:['no-min','no-full']});
  function call(name,...args){if(ended)throw Error('adapter-disposed');engine[name](...args);return snapshot();}
  function snapshot(){return {x:engine.x,y:engine.y,width:engine.width,height:engine.height,maximized:engine.max,ended};}
  function dispose(){if(!ended){ended=true;host.ownerDocument?.removeEventListener('air-profile-changing',dispose);host.ownerDocument?.defaultView?.removeEventListener('pagehide',dispose);engine.close(true);}}
  host.ownerDocument?.addEventListener('air-profile-changing',dispose,{once:true});host.ownerDocument?.defaultView?.addEventListener('pagehide',dispose,{once:true});
  return Object.freeze({move:(x,y)=>call('move',x,y),resize:(w,h)=>call('resize',w,h),focus:()=>call('focus'),maximize:()=>call('maximize'),restore:()=>call('restore'),snapshot,dispose});
 }
 const api={preflight,create};if(typeof module==='object')module.exports=api;else root.airWinBoxEvaluation=api;
})(typeof window==='object'?window:null);

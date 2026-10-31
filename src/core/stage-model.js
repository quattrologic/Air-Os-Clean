'use strict';
// Independent Air-OS implementation of functional stage/group requirements.
// No Origin, GNOME or Dash-to-Dock source is incorporated.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airStageMath=api;})(typeof window==='object'?window:null,function(){
 const empty=()=>({enabled:false,groups:[],order:[]});
 function validate(value,known=()=>true){
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['enabled','groups','order'].includes(k))||typeof value.enabled!=='boolean'||!Array.isArray(value.groups)||value.groups.length>30||!Array.isArray(value.order)||value.order.length>60)throw TypeError('Ungültige Stage-Einstellungen.');
  const used=new Set(),keys=new Set();
  const groups=value.groups.map(g=>{
   if(!g||Object.keys(g).some(k=>!['id','apps'].includes(k))||typeof g.id!=='string'||!/^g-[a-f0-9-]{8,40}$/.test(g.id)||keys.has(g.id)||!Array.isArray(g.apps)||g.apps.length<2||g.apps.length>60)throw TypeError('Ungültige Fenstergruppe.');
   keys.add(g.id);const apps=g.apps.map(id=>{if(typeof id!=='string'||!known(id)||used.has(id))throw TypeError('Ungültige Gruppen-App.');used.add(id);return id;});return {id:g.id,apps};
  });
  const order=value.order.map(id=>{if(typeof id!=='string'||(!keys.has(id)&&!known(id)))throw TypeError('Ungültige Stage-Reihenfolge.');return id;});
  if(new Set(order).size!==order.length)throw TypeError('Doppelte Stage.');return {enabled:value.enabled,groups,order};
 }
 function stages(ids,settings){
  const available=[...new Set(ids)],assigned=new Set(),list=[];
  for(const group of settings.groups){const apps=group.apps.filter(id=>available.includes(id));if(apps.length){list.push({id:group.id,apps});apps.forEach(id=>assigned.add(id));}}
  available.filter(id=>!assigned.has(id)).forEach(id=>list.push({id,apps:[id]}));
  const rank=id=>{const n=settings.order.indexOf(id);return n<0?settings.order.length+list.findIndex(g=>g.id===id):n;};return list.sort((a,b)=>rank(a.id)-rank(b.id));
 }
 function move(order,id,before){const next=order.filter(x=>x!==id),index=next.indexOf(before);next.splice(index<0?next.length:index,0,id);return next;}
 function overlap(a,b){return a.width>0&&a.height>0&&b.width>0&&b.height>0&&a.left<b.left+b.width&&a.left+a.width>b.left&&a.top<b.top+b.height&&a.top+a.height>b.top;}
 function miniature(box,area,width=224,height=130){
  const scale=Math.min(width/Math.max(1,area.width),height/Math.max(1,area.height));
  const w=Math.max(12,Math.min(width,box.width*scale)),h=Math.max(10,Math.min(height,box.height*scale));return {left:Math.max(0,Math.min(width-w,box.left*scale)),top:Math.max(0,Math.min(height-h,box.top*scale)),width:w,height:h};
 }
 return Object.freeze({empty,validate,stages,move,overlap,miniature});
});

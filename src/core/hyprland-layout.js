/* Hyprland BSD-3-Clause vaxerski2022-2026. Pure portions of Dwindle/Master/Monocle and AnimationManager::updateVariable. */
(function(root,f){const m=f();if(typeof module==='object')module.exports=m;if(root)root.airHyprLayout=m;})(typeof window==='object'?window:null,()=>{
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function split(box,ratio=1){ratio=clamp(ratio,.1,1.9);const horizontal=box.width>=box.height,first=(horizontal?box.width:box.height)/2*ratio;return horizontal?[{...box,width:first},{...box,left:box.left+first,width:box.width-first}]:[{...box,height:first},{...box,top:box.top+first,height:box.height-first}];}
 function tree(ids){return ids.length===1?{id:ids[0]}:ids.length?{children:[{id:ids[0]},tree(ids.slice(1))]}:null;}
 function recurse(node,box,out,ratio,depth=0){if(!node)return;if(node.id){out[node.id]=box;return;}const [a,b]=split(box,depth?1:ratio*2);recurse(node.children[0],a,out,ratio,depth+1);recurse(node.children[1],b,out,ratio,depth+1);}
 function arrange(ids,box,mode='floating',ratio=.55,active=ids[0],gap=8){ids=[...new Set(ids)].slice(0,60);ratio=clamp(ratio,.2,.8);const out={};let fallback=false;if(mode==='floating'||!ids.length)return{boxes:out,hidden:[],fallback};if(mode==='dwindle')recurse(tree(ids),box,out,ratio);else if(mode==='master'&&ids.length>1){const width=box.width*ratio;out[ids[0]]={...box,width};let y=box.top;for(const id of ids.slice(1)){const height=box.height/(ids.length-1);out[id]={left:box.left+width,top:y,width:box.width-width,height};y+=height;}}else for(const id of ids)out[id]={...box};
  // Electron minimum hitboxes: impossible layouts degrade to Monocle instead of clipping controls.
  if(Object.values(out).some(b=>b.width<Math.min(320,box.width)||b.height<Math.min(220,box.height))){fallback=true;mode='monocle';for(const id of ids)out[id]={...box};}
  const hidden=mode==='monocle'?ids.filter(id=>id!==(ids.includes(active)?active:ids[0])):[];for(const b of Object.values(out)){const g=mode==='monocle'?0:Math.min(gap/2,b.width/10,b.height/10);b.left+=g;b.top+=g;b.width-=2*g;b.height-=2*g;}return{boxes:out,hidden,fallback};
 }
 function interpolate(begin,goal,point){return begin+(goal-begin)*clamp(point,0,1);}
 return{split,tree,arrange,interpolate};
});

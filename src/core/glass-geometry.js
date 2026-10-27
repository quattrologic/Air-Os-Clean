/* Air-OS shape adapter. Existing 12px inverse corners, no new dock geometry. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.airGlassGeometry=api;})(typeof window==='object'?window:null,()=>{
 function rectDistance(x,y,w,h,radii){const qx=x-w/2,qy=y-h/2,r=Math.min(w/2,h/2,radii[qy<0?(qx<0?0:1):(qx<0?3:2)]||0),dx=Math.abs(qx)-w/2+r,dy=Math.abs(qy)-h/2+r;return Math.hypot(Math.max(dx,0),Math.max(dy,0))+Math.min(Math.max(dx,dy),0)-r;}
 function distance(x,y,w,h,mode=0,radii=[0,0,0,0]){const e=mode?12:0,body=rectDistance(x-e,y,w,h,radii);if(!mode)return body;const cy=mode===1?h-12:12,by=mode===1?h-6:6;
  const foot=cx=>Math.max(rectDistance(x-(cx===0?0:w+12),y-(by-6),12,12,[0,0,0,0]),12.25-Math.hypot(x-cx,y-cy));
  return Math.min(body,foot(0),foot(w+24));
 }
 function cover(iw,ih,w,h,size='cover',position='50% 50%'){
  let dw,dh;if(size==='cover'||size==='contain'){const s=(size==='cover'?Math.max:Math.min)(w/iw,h/ih);dw=iw*s;dh=ih*s;}else{const parts=size.split(/\s+/);const dimension=(v,total,natural)=>v==='auto'?null:v?.endsWith('%')?parseFloat(v)*total/100:Number.isFinite(parseFloat(v))?parseFloat(v):natural;dw=dimension(parts[0],w,iw);dh=dimension(parts[1]||'auto',h,ih);if(dw===null&&dh===null){dw=iw;dh=ih;}else if(dw===null)dw=dh*iw/ih;else if(dh===null)dh=dw*ih/iw;}
  const parts=position.split(/\s+/),offset=(v,space)=>v==='left'||v==='top'?0:v==='right'||v==='bottom'?space:v==='center'?space/2:v?.endsWith('%')?parseFloat(v)*space/100:parseFloat(v)||0;
  return {x:offset(parts[0]||'50%',w-dw),y:offset(parts[1]||'50%',h-dh),width:dw,height:dh};
 }
 function layers(value){const out=[];let level=0,start=0;for(let i=0;i<value.length;i++){if(value[i]==='(')level++;if(value[i]===')')level--;if(value[i]===','&&level===0){out.push(value.slice(start,i).trim());start=i+1;}}out.push(value.slice(start).trim());return out;}
 function gradient(ctx,value,w,h){if(!value.startsWith('linear-gradient('))return false;const parts=layers(value.slice(16,-1));let angle=180;if(parts[0].endsWith('deg'))angle=parseFloat(parts.shift());const theta=angle*Math.PI/180,ux=Math.sin(theta),uy=-Math.cos(theta),length=Math.abs(w*ux)+Math.abs(h*uy),g=ctx.createLinearGradient(w/2-ux*length/2,h/2-uy*length/2,w/2+ux*length/2,h/2+uy*length/2);for(let i=0;i<parts.length;i++){const match=parts[i].match(/^(.*?)\s+(-?\d+(?:\.\d+)?)%$/);g.addColorStop(match?Math.max(0,Math.min(1,Number(match[2])/100)):i/(parts.length-1),match?match[1]:parts[i]);}ctx.fillStyle=g;ctx.fillRect(0,0,w,h);return true;}
 function gpu(renderer){const name=String(renderer||'');if(/swiftshader|llvmpipe|software|softpipe|lavapipe|warp|microsoft basic render/i.test(name))return 'software';if(/nvidia|geforce|radeon|\bAMD\b|intel|apple|adreno|mali|powervr/i.test(name))return 'hardware-candidate';return 'unknown';}
 function resolution(w,h,dpr,budget,limit=4096){const ratio=Math.min(Math.max(1,Number(dpr)||1),3,Math.sqrt(budget/(w*h)),limit/w,limit/h);return {width:Math.max(1,Math.floor(w*ratio)),height:Math.max(1,Math.floor(h*ratio)),ratio};}
 // MacShell1bdb518: actual MacDock/ClockWidget/GlassSlab callsites, not GLSL defaults.
 function material(kind,height){
  const common={saturation:1.25,dark:1,shadowAmt:0,flatInner:1,ringW:0};
  if(kind==='dock')return {...common,thickness:30,dispersion:.06,blurPx:1.5,tintMix:.42*.55,rim:.45*.20,grain:.03*.3,magnify:.08,rimTint:0,edgeTint:[0,0,0,0]};
  if(kind==='widget')return {...common,thickness:30,dispersion:.06,blurPx:1,tintMix:.25+.42*.8,rim:.45,grain:.03*.15,magnify:.08*Math.min(1,90/Math.max(1,height)),rimTint:1};
  if(kind==='island')return {...common,thickness:16*1.6,dispersion:.06*1.3,blurPx:1.5,tintMix:.42*.55,rim:.1125,grain:.03*.2,magnify:.05*1.6,rimTint:1};
  return null;
 }
 return {distance,rectDistance,cover,layers,gradient,gpu,resolution,material};
});

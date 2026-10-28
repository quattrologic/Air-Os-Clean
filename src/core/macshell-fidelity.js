/* MacShell MIT Rickky2026: GlassSlab/Slider/Switch, LiquidKnob, FeatherBlur, PlayerWidget.
 * Pure geometry/colour/mask ports. Air-OS controllers remain authoritative. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.airFidelity=api;})(typeof window==='object'?window:null,()=>{
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 function lens(kind,width,height,pos,held=false,jig=0,left=0,knobWidth=27){
  const p=clamp(pos),grow=held?1:0;
  if(kind==='switch')return{x:2+left,y:2,width:knobWidth,height:height-4,radius:(height-4)/2,thickness:Math.round((height-4)*1.1)*.85*1.6,dispersion:.06*.85*1.3,magnify:.05*.85*1.6};
  if(kind==='segment')return{x:0,y:0,width,height,radius:height/2,thickness:Math.round(height*.7)*.65*1.6,dispersion:.06*.65*1.3,magnify:.05*.65*1.6};
  const w=21+6*grow,h=14+3*grow;
  return{x:14+p*Math.max(1,width-28)-w/2-jig*3,y:11-h/2,width:w,height:h,radius:h/2,thickness:16*.85*1.6,dispersion:.06*.85*1.3,magnify:.05*.85*1.6,rotation:jig*7,scaleX:1+.32*Math.min(1.5,Math.abs(jig)),scaleY:1-.16*Math.min(1.5,Math.abs(jig))};
 }
 function feather(y,hold=52,depth=30,amount=1){const t=clamp((y-hold)/Math.max(1,depth)),blur=clamp(amount)*(1-t*t*(3-2*t));return{sharp:1-blur,blur};}
 function palette(data){let sr=0,sg=0,sb=0,sw=0;for(let i=0;i<data.length;i+=4){const r=data[i]/255,g=data[i+1]/255,b=data[i+2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),wt=(.05+(mx-mn)**2*4)*(data[i+3]/255);sr+=r*wt;sg+=g*wt;sb+=b*wt;sw+=wt;}return sw?[sr/sw,sg/sw,sb/sw]:null;}
 function hsl(rgb){const [r,g,b]=rgb,mx=Math.max(...rgb),mn=Math.min(...rgb),d=mx-mn,l=(mx+mn)/2;return[d?((mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4)/6):0,d?d/(1-Math.abs(2*l-1)):0,l];}
 function face(rgb,l=.23){const [h,s]=hsl(rgb),sat=Math.min(.7,s*.75),a=sat*Math.min(l,1-l);return[0,8,4].map(n=>{const k=(n+h*12)%12;return l-a*Math.max(-1,Math.min(k-3,9-k,1));});}
 return Object.freeze({clamp,lens,feather,palette,hsl,face});
});

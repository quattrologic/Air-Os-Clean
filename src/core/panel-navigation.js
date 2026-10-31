'use strict';
// Independent geometry-only helpers. No native actors, protected sources or timers.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airPanelMath=api;})(typeof window==='object'?window:null,function(){
 function direction(items,current,key){
  if(!items.length)return null;if(key==='Home')return items[0].id;if(key==='End')return items.at(-1).id;
  const from=items.find(x=>x.id===current)||items[0],horizontal=key==='ArrowLeft'||key==='ArrowRight',sign=['ArrowLeft','ArrowUp'].includes(key)?-1:1;
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key))return null;
  let best=null,score=Infinity;for(const item of items){if(item===from)continue;const along=(horizontal?item.x-from.x:item.y-from.y)*sign,across=Math.abs(horizontal?item.y-from.y:item.x-from.x);if(along<=1)continue;const value=along+across*3;if(value<score){score=value;best=item.id;}}return best;
 }
 function bannerStack(heights,height){const positions=[];let top=52;for(const h of heights.slice(0,4)){const size=Math.max(1,Math.min(height-76,h));if(top+size>height-16&&positions.length)break;positions.push(top);top+=size+8;}return positions;}
 return Object.freeze({direction,bannerStack});
});

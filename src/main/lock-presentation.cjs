'use strict';
// One expiring, explicitly approved public snapshot; no account/notification store.
function create({now=()=>performance.now()}={}){let approved=null,timer=null;
 function clear(){if(timer)clearTimeout(timer);timer=null;approved=null;}
 function prepare(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['title','artist','artwork'].includes(k)))throw Error('Ungültige Medienvorschau.');
  const clean=v=>{if(typeof v!=='string'||v.length>240||/[\u0000-\u001f\u007f]/.test(v))throw Error('Ungültiger Medientext.');return v;};const preview={title:clean(input.title),artist:clean(input.artist),artwork:''};
  if(input.artwork){if(typeof input.artwork!=='string'||input.artwork.length>710000||!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/.test(input.artwork))throw Error('Ungültiges Cover.');const [head,data]=input.artwork.split(',');const bytes=Buffer.from(data,'base64');if(!require('../core/music-metadata.js').picture(bytes,head.includes('png')?'image/png':'image/jpeg'))throw Error('Ungültiges Cover.');preview.artwork=input.artwork;}
  return preview;
 }
 return {prepare,clear,approve(owner,input){const preview=prepare(input);clear();approved={owner,preview,expires:now()+60000};timer=setTimeout(clear,60000);timer.unref?.();},get(username){if(!approved)return null;if(now()>=approved.expires||username!==approved.owner){clear();return null;}return {...approved.preview,remainingMs:Math.max(0,approved.expires-now()),playing:false,publicPreview:true};}};
}
module.exports={create};

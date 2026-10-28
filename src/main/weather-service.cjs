'use strict';
// Voluntary city request only. Fixed TLS hosts, no credentials, redirects, geolocation or arbitrary URLs.
const model=require('../core/weather-model.js');
function create({fetchImpl=globalThis.fetch,now=Date.now}={}){
 const active=new Set();
 async function json(url){const controller=new AbortController();active.add(controller);const timer=setTimeout(()=>controller.abort(),6000);let reader;try{const r=await fetchImpl(url,{signal:controller.signal,redirect:'error',headers:{Accept:'application/json'}});if(!r.ok)throw Error();reader=r.body.getReader();let size=0,parts=[];for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>524288)throw Error();parts.push(Buffer.from(value));}return JSON.parse(Buffer.concat(parts).toString('utf8'));}catch{throw Error('Wetterdienst nicht erreichbar. Cache bleibt erhalten.');}finally{active.delete(controller);clearTimeout(timer);controller.abort();try{await reader?.cancel();}catch{}}}
 async function search(query){if(typeof query!=='string'||query.trim().length<2||query.length>100||/[\x00-\x1f]/.test(query))throw Error('Stadtname mit2–100Zeichen eingeben.');const url=new URL('https://geocoding-api.open-meteo.com/v1/search');url.search=new URLSearchParams({name:query.trim(),count:'5',language:'de',format:'json'});const data=await json(url);if(!Array.isArray(data.results))return[];return data.results.slice(0,5).map(r=>model.location({name:String(r.name).slice(0,70)+(r.country?' · '+String(r.country).slice(0,25):''),latitude:r.latitude,longitude:r.longitude}));}
 async function forecast(value){const loc=model.location(value),url=new URL('https://api.open-meteo.com/v1/forecast');url.search=new URLSearchParams({latitude:loc.latitude,longitude:loc.longitude,current:'temperature_2m,weather_code,is_day',hourly:'temperature_2m,weather_code',daily:'temperature_2m_max,temperature_2m_min',forecast_days:'2',timezone:'auto'});return model.normalize(await json(url),loc,now());}
 return{search,forecast,cancelAll(){for(const c of active)c.abort();active.clear();}};
}
module.exports={create};

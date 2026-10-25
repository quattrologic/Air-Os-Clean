'use strict';
const candidates=[{id:'fold',file:'01-fold.svg',name:'01 · Faltkern',description:'Asymmetrischer Glasrahmen mit offenem Kern. Empfehlung: kompakt, markant und bei kleinen Größen klar.'},{id:'flow',file:'02-flow.svg',name:'02 · Strömung',description:'Eine weiche, zusammenhängende Luftströmung. Organischer und bewegter als der kantige Faltkern.'},{id:'prism',file:'03-prism.svg',name:'03 · Prisma',description:'Ein vertikaler Glaskristall mit drei facettierten Flächen. Ruhig, geometrisch und präzise.'}];
const query=new URLSearchParams(location.search),selected=candidates.find(c=>c.id===query.get('design')),mode=query.get('mode'),root=document.querySelector('#previews');
function el(tag,text,cls){const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;}
function img(c,size){const e=el('img');e.src=c.file;e.alt=c.name;e.width=e.height=size;return e;}
if(mode==='icon'&&selected){document.body.className='single';root.append(img(selected,512));}
else{
 if(mode==='sheet'&&selected)document.body.className='sheet';
 for(const c of selected?[selected]:candidates){
  const card=el('article',null,'candidate');card.append(el('h2',c.name),el('p',c.description,'description'));
  for(const theme of ['dark','light']){
   const surface=el('section',null,'surface '+theme);surface.append(el('label',theme==='dark'?'Dunkle Oberfläche':'Helle Oberfläche'));const hero=el('div',null,'hero');hero.append(img(c,mode==='sheet'?512:192));surface.append(hero);
   const sizes=el('div',null,'sizes');for(const size of [16,32,64]){const sample=el('div',null,'sample');sample.append(img(c,size),el('span',size+' px'));sizes.append(sample)}surface.append(sizes);
   if(mode==='sheet'){const large=el('div',null,'large');large.append(img(c,256));surface.append(large,el('label','Oben 512 px · unten 256 px · Originalpixel bei DPR 1'));}card.append(surface);
  }root.append(card);
 }
}

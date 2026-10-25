'use strict';
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.airNotesFormat=api;})(typeof window==='object'?window:null,()=>({
 make(input,previous,now,id){
 if(!input||typeof input.title!=='string'||input.title.length>120||typeof input.body!=='string'||new TextEncoder().encode(input.body).length>524288)throw Error('Notiz zu groß oder ungültig.');
 return {id:previous?previous.id:id,title:input.title,body:input.body,createdAt:previous?previous.createdAt:now,updatedAt:now};
 }
}));

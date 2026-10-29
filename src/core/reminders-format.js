'use strict';
// Shared validation and entry format used by native and IndexedDB stores.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airRemindersFormat=api;})(typeof window==='object'?window:null,function(){
 const ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 function validate(item){
  if(!item||typeof item!=='object'||Array.isArray(item))throw new TypeError('Invalid reminder.');
  const {id,title,details='',dueDate=null,priority='none',completed=false}=item;
  if(id!=null&&(typeof id!=='string'||!ID.test(id)))throw new TypeError('Invalid reminder ID.');
  if(typeof title!=='string'||!title.trim()||title.length>140||typeof details!=='string'||details.length>2000)throw new TypeError('Invalid reminder text.');
  if(!['none','low','medium','high'].includes(priority)||typeof completed!=='boolean')throw new TypeError('Invalid reminder state.');
  if(dueDate!==null&&(typeof dueDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)||Number.isNaN(Date.parse(dueDate))||new Date(dueDate+'T12:00:00Z').toISOString().slice(0,10)!==dueDate))throw new TypeError('Invalid due date.');
  if(item.list!==undefined&&(typeof item.list!=='string'||!item.list.trim()||item.list.length>60))throw new TypeError('Invalid reminder list.');
  return {id,title:title.trim(),details,dueDate,priority,completed,...(item.list!==undefined?{list:item.list.trim()}:{} )};
 }
 function make(item,previous,now,id){const value=validate(item);return {...value,id:previous?.id||id,createdAt:previous?.createdAt||now,updatedAt:now};}
 return Object.freeze({validate,make,ID});
});

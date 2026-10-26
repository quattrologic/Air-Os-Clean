'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airTahoeAppModel=api;})(typeof window==='object'?window:null,function(){
 const day=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 function matches(item,query){return String(item.title||'').toLocaleLowerCase('de-DE').includes(query.trim().toLocaleLowerCase('de-DE'));}
 function reminder(item,filter,query,now=new Date()){const today=day(now);return matches(item,query)&&(filter==='all'||filter==='open'&&!item.completed||filter==='done'&&item.completed||filter==='today'&&!item.completed&&item.dueDate===today||filter==='overdue'&&!item.completed&&item.dueDate&&item.dueDate<today);}
 // MacBar calCells: local noon, Monday start, 42 cells; avoids UTC date-only parsing.
 function calendar(year,month){const offset=(new Date(year,month,1).getDay()+6)%7;return Array.from({length:42},(_,i)=>{const d=new Date(year,month,1-offset+i,12);return {date:day(d),n:d.getDate(),current:d.getMonth()===month};});}
 return Object.freeze({day,matches,reminder,calendar});
});

'use strict';
// Session-bounded projections from existing services, never another persistent cache.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airWidgetData=api;})(typeof window==='object'?window:null,function(){
 function create({api,calendar,owner,alive,onState}){let disposed=false;const versions={};
  async function refresh(kind){const version=versions[kind]=(versions[kind]||0)+1,valid=()=>!disposed&&versions[kind]===version&&alive();try{if(!valid())return;onState(kind,{phase:'loading',items:[]});if((await api.currentUser())?.preferenceSession!==owner||!valid())return;const list=await(kind==='calendar'?calendar():api[kind].list());if(!valid()||(await api.currentUser())?.preferenceSession!==owner||!valid())return;if(!Array.isArray(list))throw Error('invalid-list');let items;
    if(kind==='notes')items=list.slice().sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0,3).map(n=>({id:String(n.id),title:String(n.title||'Ohne Titel')}));
    else if(kind==='reminders')items=list.filter(n=>n.completed===false).sort((a,b)=>(a.dueDate||'9999').localeCompare(b.dueDate||'9999')).slice(0,3).map(n=>({id:String(n.id),title:String(n.title||''),date:String(n.dueDate||'')}));
    else items=list.map(n=>({id:String(n.id),title:String(n.title||''),date:String(n.date||''),time:String(n.time||'')})).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
    onState(kind,{phase:'ready',items});
   }catch{if(valid())onState(kind,{phase:'error',items:[]});}}
  function clear(){for(const kind of ['notes','reminders','calendar']){versions[kind]=(versions[kind]||0)+1;onState(kind,{phase:'empty',items:[]});}}
  return {refresh,clear,dispose(){disposed=true;clear();}};
 }
 return Object.freeze({create});
});

'use strict';
const crypto=require('node:crypto'),model=require('../core/nexus-model.js');
function create({load,save,emit,now=Date.now,setTimeout:schedule=setTimeout,clearTimeout:cancel=clearTimeout}){
 let owner=null,job=null;function stop(){if(job!==null)cancel(job);job=null;owner=null;}
 function arm(){if(job!==null)cancel(job);job=null;const t=load();if(!owner||t?.state!=='running')return;const expected=owner;job=schedule(()=>{job=null;if(owner!==expected)return;const current=load();if(current?.id!==t.id||current.state!=='running')return;if(model.remaining(current,now())>0){arm();return;}const next={...current,state:'done',remaining:0};save(next);emit({owner,value:next,finished:true});},Math.min(2147483647,Math.max(0,t.deadline-now())));job?.unref?.();}
 function begin(token){stop();owner=token;arm();}
 function act(action,data){const current=load();let next;if(action==='start'){if(!data||!['countdown','pomodoro','break'].includes(data.kind)||!Number.isSafeInteger(data.seconds)||data.seconds<1||data.seconds>86400)throw Error('Timer: 1 Sekunde bis 24 Stunden.');const duration=(data.kind==='pomodoro'?1500:data.kind==='break'?300:data.seconds)*1000;next={kind:data.kind,state:'running',duration,remaining:duration,deadline:now()+duration,id:crypto.randomBytes(16).toString('hex')};}else if(action==='reset')next=null;else if(action==='pause'&&current?.state==='running')next={...current,state:'paused',remaining:model.remaining(current,now())};else if(action==='resume'&&current?.state==='paused'&&current.remaining>0)next={...current,state:'running',deadline:now()+current.remaining};else throw Error('Timeraktion derzeit nicht möglich.');model.timer(next);save(next);arm();emit({owner,value:next,finished:false});return next;}
 return {begin,stop,act,snapshot:()=>load()};
}
module.exports={create};

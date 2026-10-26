'use strict';
// Session-owned, ephemeral screen-sleep prevention. Never restore from preferences.
function createController(driver,{available=true}={}){
 let id=null,owner=null;
 function release(){if(id!==null){if(driver.isStarted(id))driver.stop(id);id=null;}owner=null;}
 function status(session){return {available,active:owner===session&&id!==null&&driver.isStarted(id)};}
 function set(enabled,session){if(typeof enabled!=='boolean'||typeof session!=='string'||!session)throw new TypeError('Ungültige Keep-Awake-Anfrage.');if(!enabled){release();return status(session);}if(!available)throw Error('Keep Awake ist in diesem Testmodus nicht verfügbar.');if(owner!==session)release();if(id===null||!driver.isStarted(id)){const next=driver.start('prevent-display-sleep');id=next;owner=session;}return status(session);}
 return {set,status,release};
}
module.exports={createController};

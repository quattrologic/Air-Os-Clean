'use strict';
// Playwright 1.62 treats a Promise as a truthy predicate before its boolean resolves.
// Await every actual browser result in Node; only a truthy RESOLVED value succeeds.
async function waitForAsync(page,predicate,arg,{timeout=30000,interval=50}={}){
 const deadline=Date.now()+timeout;let samples=0;
 while(Date.now()<deadline){const value=await page.evaluate(predicate,arg);samples++;if(value)return value;await page.waitForTimeout(Math.min(interval,Math.max(0,deadline-Date.now())));}
 throw Error('Resolved asynchronous browser condition remained false after '+samples+' samples ('+timeout+'ms).');
}
module.exports={waitForAsync};

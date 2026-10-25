'use strict';
// Keep the entire suite mandatory, and expose bounded failure diagnostics in
// public Actions annotations when the API/log endpoint is unavailable.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),files=fs.readdirSync(path.join(root,'tests')).filter(x=>x.endsWith('.test.cjs')).sort().map(x=>path.join(root,'tests',x));
const result=spawnSync(process.execPath,['--test','--test-reporter=tap',...files],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
const output=(result.stdout||'')+(result.stderr||'');process.stdout.write(output);
const dir=path.join(root,'dist/r1-gui');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'node-tests.tap'),output);
if(result.status!==0){
 const escape=x=>x.replace(/%/g,'%25').replace(/\r/g,'%0D').replace(/\n/g,'%0A');
 const failures=[...output.matchAll(/^not ok \d+ - (.+)\n([\s\S]*?)(?=^ok \d+|^not ok \d+|^1\.\.|$(?![\s\S]))/gm)];
 for(const f of failures)console.log('::error title=Node regression failed::'+escape((f[1]+'\n'+f[2]).slice(0,5500)));
 if(!failures.length)console.log('::error::'+escape((result.error?.message||output||'Node test runner exited without output').slice(-5500)));
}
process.exitCode=result.status===0?0:1;

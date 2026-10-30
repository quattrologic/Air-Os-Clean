'use strict';
const test=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const g=require('../scripts/ipad-pages-guard.cjs'),sha='a'.repeat(40),old='b'.repeat(40);
const approved=()=>({event:'workflow_dispatch',repository:g.REPOSITORY,ref:g.BRANCH,sha,head:sha,remoteHead:sha,actor:'quattrologic',triggeringActor:'quattrologic',inputs:{public_confirmation:g.CONFIRM,site_review:g.REVIEW,source_commit:sha}});
const repository='fixture/Example',config=()=>({html_url:'https://fixture.github.io/Example/',build_type:'workflow',https_enforced:true,cname:null,status:null});
test('iPad Pages approval requires exact owner, manual event, branch, SHA lease and public site review',()=>{
 a.equal(g.approval(approved()),sha);
 for(const patch of [{event:'push'},{repository:'someone/Other'},{ref:'refs/heads/main'},{actor:'collaborator'},{triggeringActor:'collaborator'},{head:old},{remoteHead:old},{sha:old},{inputs:{...approved().inputs,public_confirmation:''}},{inputs:{...approved().inputs,site_review:''}},{inputs:{...approved().inputs,previous_source_commit:'../other'}}])a.throws(()=>g.approval({...approved(),...patch}));
});
test('Pages destination accepts only a verified new site or explicitly leased owned iPad site',()=>{
 a.equal(g.baseURL({...config(),html_url:'https://fixture.github.io/Example'},repository),'https://fixture.github.io/Example/');
 const fresh=g.destination(config(),{indexStatus:404,infoStatus:404},'',repository);a.equal(fresh.mode,'new-empty-site');
 const own={indexStatus:200,infoStatus:200,info:{product:'Air-OS Ultimate iPad PWA',target:'browser-pwa',sourceDirty:false,commit:old}};
 a.equal(g.destination({...config(),status:'built'},own,old,repository).mode,'update-owned-ipad-site');
 for(const probe of [{indexStatus:200,infoStatus:404},{indexStatus:403,infoStatus:404},{indexStatus:404,infoStatus:500},{...own,info:{...own.info,product:'Other app'}},{...own,info:{...own.info,sourceDirty:true}}])a.throws(()=>g.destination(config(),probe,old,repository));
 a.throws(()=>g.destination({...config(),status:'built'},{indexStatus:404,infoStatus:404},'',repository));
 a.throws(()=>g.destination(config(),own,'',repository));a.throws(()=>g.destination(config(),own,sha,repository));
});
test('Pages guard rejects legacy settings, arbitrary origins, insecure/custom mismatches',()=>{
 for(const patch of [{build_type:'legacy'},{html_url:'http://fixture.github.io/Example/'},{https_enforced:false},{html_url:'https://attacker.invalid/Example/'},{html_url:'https://fixture.github.io/'},{html_url:'https://fixture.github.io/Example/?key=x'},{cname:'different.invalid'},{html_url:'https://fixture.github.io/Example/\n'}])a.throws(()=>g.baseURL({...config(),...patch},repository));
 a.equal(g.baseURL({...config(),cname:'site.example',html_url:'https://site.example/'},repository),'https://site.example/');
});
test('Pages API failures never imply an empty site and tokens stay off public site requests',async()=>{
 const calls=[],fake=async(url,opts)=>{calls.push({url,opts});return new Response('denied',{status:403});};
 await a.rejects(g.inspect('synthetic-test-token','',fake),/cannot be verified/);
 a.equal(calls.length,1);a.equal(calls[0].opts.headers.Authorization,'Bearer synthetic-test-token');
 calls.length=0;await g.request('https://fixture.github.io/Example/',{fetcher:fake});a.equal(calls[0].opts.headers.Authorization,undefined);a.equal(calls[0].opts.redirect,'error');
 await a.rejects(g.request('https://fixture.invalid/',{fetcher:async()=>new Response('x',{headers:{'content-length':'1048577'}})}),/too large/);
});
test('new Pages workflow stays manual-only, has minimal permissions and uploads the website directory',()=>{
 const w=fs.readFileSync(path.join(__dirname,'../.github/workflows/deploy-air-os-ipad.yml'),'utf8');
 a.match(w,/workflow_dispatch:/);a.doesNotMatch(w,/\n\s+(push|pull_request|schedule|workflow_run|workflow_call):/);
 for(const s of ['public_confirmation:','source_commit:','site_review:','previous_source_commit:','ipad-pages-guard.cjs source','ipad-pages-guard.cjs destination','ipad-pages-guard.cjs recheck','actions/configure-pages@v5','enablement: false','node scripts/run-test-gate.cjs','path: dist/pwa','actions/deploy-pages@v4','steps.deployment.outputs.page_url','name: github-pages'])a.ok(w.includes(s),s);
 a.match(w,/pages: read/);a.match(w,/pages: write/);a.match(w,/id-token: write/);a.doesNotMatch(w,/contents: write|secrets\.|enablement: true/);
 a.ok(w.indexOf('ipad-pages-guard.cjs recheck')<w.indexOf('uses: actions/deploy-pages@v4'));
 a.match(w,/group: air-os-pwa-public-pages/);
});

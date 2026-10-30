'use strict';
// Read-only release guards. This module never enables Pages or creates a deployment.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const REPOSITORY='quattrologic/Air-Os-Clean',BRANCH='refs/heads/feat/air-os-ipad-ultimate',BASE='4a82ac41fcc43eb6ebde34f6422cb2bdd239f971';
const CONFIRM='publish-air-os-ipad-publicly',REVIEW='exclusive-air-os-ipad-site-reviewed',SHA=/^[0-9a-f]{40}$/;
function approval(c){
 const i=c.inputs||{};
 if(c.event!=='workflow_dispatch'||c.repository!==REPOSITORY||c.ref!==BRANCH)throw Error('Manual iPad branch dispatch required.');
 if(c.actor!=='quattrologic'||(c.triggeringActor||c.actor)!=='quattrologic')throw Error('Repository owner approval required.');
 if(i.public_confirmation!==CONFIRM||i.site_review!==REVIEW)throw Error('Explicit public publication and exclusive-site review required.');
 if(!SHA.test(i.source_commit||'')||i.source_commit!==c.sha||i.source_commit!==c.head||i.source_commit!==c.remoteHead)throw Error('Reviewed source SHA must equal selected and current iPad branch HEAD.');
 if(i.previous_source_commit&&!SHA.test(i.previous_source_commit))throw Error('Invalid prior deployment SHA.');
 return i.source_commit;
}
function baseURL(config,repository=REPOSITORY){
 if(config?.build_type!=='workflow')throw Error('Owner must configure Pages source as GitHub Actions; no automatic setting change.');
 if(typeof config.html_url!=='string'||/[\r\n]/.test(config.html_url))throw Error('Pages HTTPS address missing.');
 const url=new URL(config.html_url),[owner,repo]=repository.split('/');if(!url.pathname.endsWith('/'))url.pathname+='/';
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||config.https_enforced===false)throw Error('Pages HTTPS must be enabled by the owner.');
 if(config.cname){if(url.hostname!==config.cname.toLowerCase()||url.pathname!=='/')throw Error('Unexpected Pages custom domain/path.');}
 else if(url.hostname!==owner.toLowerCase()+'.github.io'||url.pathname!=='/'+repo+'/')throw Error('Unexpected repository Pages destination.');
 return url.href;
}
function destination(config,probe,previous='',repository=REPOSITORY){
 const base=baseURL(config,repository),info=probe.info;
 if(config.status===null&&probe.indexStatus===404&&probe.infoStatus===404&&!previous)return {base_url:base,mode:'new-empty-site',previous_commit:null};
 if(probe.infoStatus!==200||!info||info.product!=='Air-OS Ultimate iPad PWA'||info.target!=='browser-pwa'||info.sourceDirty!==false||!SHA.test(info.commit||''))
  throw Error('Existing or unverifiable Pages content: publication blocked; no unrelated site may be overwritten.');
 if(!previous||previous!==info.commit)throw Error('Existing Air-OS site requires its exact reviewed previous source SHA.');
 return {base_url:base,mode:'update-owned-ipad-site',previous_commit:info.commit};
}
async function request(url,{api=false,token='',fetcher=fetch}={}){
 const response=await fetcher(url,{headers:api?{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}:{Accept:'application/json, text/html;q=0.5'},redirect:'error',signal:AbortSignal.timeout(15000),cache:'no-store'});
 if(Number(response.headers.get('content-length'))>1024*1024)throw Error('Destination response too large.');
 const parts=[];let size=0;for await(const part of response.body){size+=part.length;if(size>1024*1024)throw Error('Destination response too large.');parts.push(part);}
 const text=Buffer.concat(parts).toString('utf8');return {status:response.status,text};
}
async function inspect(token,previous,fetcher){
 if(!token)throw Error('A read-only Pages token is required to inspect the destination.');
 const r=await request('https://api.github.com/repos/'+REPOSITORY+'/pages',{api:true,token,fetcher});
 if(r.status!==200)throw Error('Pages configuration cannot be verified (HTTP '+r.status+'). Owner must review/enable Actions source and HTTPS after approval.');
 const config=JSON.parse(r.text),base=baseURL(config);
 const index=await request(base,{fetcher}),meta=await request(new URL('BUILD-INFO.json',base).href,{fetcher});
 let info;try{info=JSON.parse(meta.text);}catch{}
 return destination(config,{indexStatus:index.status,infoStatus:meta.status,info},previous);
}
function source(root,env=process.env){
 const git=(...args)=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 const event=JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH,'utf8'));
 const head=git('rev-parse','HEAD'),remote=git('ls-remote','--heads','origin',BRANCH).split(/\s+/)[0];
 const sha=approval({inputs:event.inputs,event:env.GITHUB_EVENT_NAME,repository:env.GITHUB_REPOSITORY,ref:env.GITHUB_REF,sha:env.GITHUB_SHA,actor:env.GITHUB_ACTOR,triggeringActor:env.GITHUB_TRIGGERING_ACTOR,head,remoteHead:remote});
 git('merge-base','--is-ancestor',BASE,sha);
 if(git('status','--porcelain','--untracked-files=no'))throw Error('Source checkout must be clean.');
 return {sha,inputs:event.inputs,git};
}
async function main(){
 const root=path.resolve(__dirname,'..'),mode=process.argv[2],c=source(root),out=path.join(root,'dist/ipad-pages-evidence');
 fs.mkdirSync(out,{recursive:true});
 const output=(k,v)=>{if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,k+'='+v+'\n');};
 if(mode==='source'){output('source_sha',c.sha);console.log('Reviewed iPad source: '+c.sha);return;}
 if(mode==='destination'||mode==='recheck'){
  const plan={source_commit:c.sha,...await inspect(process.env.GITHUB_TOKEN,c.inputs.previous_source_commit)};
  if(plan.previous_commit)c.git('merge-base','--is-ancestor',plan.previous_commit,c.sha);
  fs.writeFileSync(path.join(out,'destination-plan.json'),JSON.stringify(plan,null,2));output('base_url',plan.base_url);
  console.log(JSON.stringify({...plan,publication:'not performed by this guard'}));return;
 }
 if(mode==='configured'){
  const plan=JSON.parse(fs.readFileSync(path.join(out,'destination-plan.json'),'utf8'));
  if(new URL(process.env.PAGES_BASE_URL.replace(/\/?$/,'/')).href!==plan.base_url)throw Error('configure-pages destination differs from reviewed site.');
  return;
 }
 if(mode==='verify'){
  const url=new URL(process.env.DEPLOYED_PAGE_URL);if(!url.pathname.endsWith('/'))url.pathname+='/';
  let verified=false,lastError;for(let attempt=0;attempt<3;attempt++){try{
  const planned=await inspect(process.env.GITHUB_TOKEN,c.sha);
  if(url.href!==planned.base_url)throw Error('Deployed URL differs from reviewed Pages site.');
  const info=JSON.parse((await request(new URL('BUILD-INFO.json',url).href)).text);
  if(info.commit!==c.sha)throw Error('Published build SHA does not match approved source.');
  const manifest=JSON.parse((await request(new URL('manifest.webmanifest',url).href)).text);
  if(manifest.name!=='Air-OS Ultimate'||manifest.display!=='standalone'||manifest.id!=='./'||manifest.start_url!=='./'||manifest.scope!=='./')throw Error('Published PWA manifest mismatch.');
  const home=await request(url.href),worker=await request(new URL('sw.js',url).href);
  if(home.status!==200||worker.status!==200||!home.text.includes('apple-mobile-web-app-capable')||!worker.text.includes('allowed.has(target)'))throw Error('Published application shell/worker not verified.');
  verified=true;break;}catch(error){lastError=error;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,4000));}}
  if(!verified)throw lastError;
  console.log('Verified published HTTPS app: '+url.href+' @ '+c.sha);
  if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'Published and verified: '+url.href+'\n\nSource: '+c.sha+'\n');
  return;
 }
 throw Error('Unknown guard mode.');
}
module.exports={approval,baseURL,destination,inspect,request,REPOSITORY,BRANCH,CONFIRM,REVIEW};
if(require.main===module)main().catch(e=>{console.error('::error title=iPad Pages guard::'+e.message.replace(/[\r\n]/g,' '));process.exitCode=1;});

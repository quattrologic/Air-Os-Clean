'use strict';
const crypto=require('node:crypto'),path=require('node:path');
const APP_ID=/^com\.[a-z0-9-]+(?:\.[a-z0-9-]+){1,8}$/;
const SEMVER=/^[0-9]+\.[0-9]+\.[0-9]+$/;
const FILE=/^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,119}$/;
const ALLOWED=new Set(['.html','.js','.css','.json','.svg','.png','.jpg','.jpeg','.webp']);
function validateFileName(name){
 if(typeof name!=='string'||!FILE.test(name)||name.includes('..')||name.includes('//')||name.startsWith('/')||name.includes('\\')||name.split('/').some(p=>p==='.'||p==='..'||!p))throw new TypeError('Unsafe file path.');
 if(!ALLOWED.has(path.posix.extname(name)))throw new TypeError('File type is not allowed.');
 return name;
}
function validateManifest(m){
 if(!m||typeof m!=='object'||Array.isArray(m)||m.schemaVersion!==1)throw new TypeError('Invalid package manifest.');
 if(typeof m.id!=='string'||!APP_ID.test(m.id)||m.id.length>90)throw new TypeError('Invalid app ID.');
 if(typeof m.name!=='string'||!m.name.trim()||m.name.length>80||typeof m.author!=='string'||m.author.length>80||typeof m.description!=='string'||m.description.length>500)throw new TypeError('Invalid metadata.');
 if(typeof m.version!=='string'||!SEMVER.test(m.version))throw new TypeError('Invalid version.');
 if(!Array.isArray(m.permissions)||m.permissions.length!==0)throw new TypeError('Untrusted packages cannot request permissions yet.');
 if(!Array.isArray(m.platforms)||!m.platforms.length||!m.platforms.every(p=>['darwin','win32','linux'].includes(p)))throw new TypeError('Invalid platforms.');
 if(!Array.isArray(m.files)||!m.files.length||m.files.length>64)throw new TypeError('Invalid file list.');
 if(typeof m.entry!=='string'||!m.entry.endsWith('.html'))throw new TypeError('Invalid entrypoint.');
 const seen=new Set();
 for(const entry of m.files){
  if(!entry||typeof entry!=='object')throw new TypeError('Invalid file.');
  validateFileName(entry.path);
  if(seen.has(entry.path))throw new TypeError('Duplicate file path.');
  if(typeof entry.sha256!=='string'||!/^[0-9a-f]{64}$/.test(entry.sha256))throw new TypeError('Invalid digest.');
  seen.add(entry.path);
 }
 if(!seen.has(m.entry))throw new TypeError('Missing entrypoint.');
 return m;
}
function verifyPackage(pkg,publicKey){
 if(!pkg||typeof pkg!=='object'||!pkg.manifest||!pkg.assets||typeof pkg.assets!=='object'||Array.isArray(pkg.assets))throw new TypeError('Malformed airapp package.');
 const m=validateManifest(pkg.manifest);
 if(typeof pkg.signature!=='string'||!/^[-A-Za-z0-9+/=]{80,120}$/.test(pkg.signature))throw new TypeError('Invalid signature.');
 const signature=Buffer.from(pkg.signature,'base64');
 if(signature.length!==64||!crypto.verify(null,Buffer.from(JSON.stringify(m),'utf8'),publicKey,signature))throw new Error('Package signature verification failed.');
 const files=new Map();let size=0;
 if(Object.keys(pkg.assets).length!==m.files.length)throw new TypeError('Unexpected package files.');
 for(const file of m.files){
  const b64=pkg.assets[file.path];
  if(typeof b64!=='string'||b64.length>8*1024*1024||!/^[A-Za-z0-9+/]*={0,2}$/.test(b64))throw new TypeError('Invalid file payload.');
  const bytes=Buffer.from(b64,'base64');
  if(bytes.toString('base64')!==b64)throw new TypeError('Non-canonical payload.');
  size+=bytes.length;if(size>6*1024*1024)throw new Error('Package too large.');
  if(crypto.createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw new Error('File integrity check failed.');
  files.set(file.path,bytes);
 }
 return {manifest:m,files};
}
module.exports={validateManifest,verifyPackage,validateFileName};

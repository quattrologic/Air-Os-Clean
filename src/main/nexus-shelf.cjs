'use strict';
// One temporary, Main-owned shelf. Originals are never moved or deleted.
const fs=require('node:fs'),fsp=fs.promises,path=require('node:path'),crypto=require('node:crypto'),edge=require('../core/edge-drop.js'),model=require('../core/nexus-model.js');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function create({tempRoot,nativeImage,clipboard,now=Date.now}){
 let epoch=0,root=null,items=new Map(),bytes=0,queue=Promise.resolve();
 const privateRoot=()=>root||(root=fs.mkdtempSync(path.join(tempRoot(),'air-nexus-shelf-')));
 function get(id){if(typeof id!=='string'||!items.has(id))throw Error('Ablageelement nicht verfügbar.');return items.get(id);}
 function view(i){return{id:i.id,kind:i.kind,name:i.name,text:i.text||'',preview:i.preview||'',bytes:i.bytes||0,favorite:i.favorite===true,created:i.created,source:i.source,children:i.children?[...i.children]:undefined};}
 function list(){const child=new Set([...items.values()].flatMap(i=>i.children||[]));return {items:[...items.values()].filter(i=>!child.has(i.id)).map(view).reverse(),count:items.size,bytes,temporary:true};}
 function add(data){const found=[...items.values()].find(i=>i.signature===data.signature);if(found)return found;
 if(items.size>=model.MAX_ITEMS||bytes+(data.bytes||0)>model.MAX_BYTES)throw Error('Ablage voll (80 Elemente / 64 MB). Bitte zuerst entfernen.');
 const i={...data,id:crypto.randomUUID(),favorite:false,created:now()};items.set(i.id,i);bytes+=i.bytes||0;return i;}
 function text(value,source='manual'){if(typeof value!=='string'||!value.trim()||Buffer.byteLength(value,'utf8')>65536||value.includes('\0'))throw Error('Text fehlt oder ist zu groß.');const kind=edge.isLinkText(value.trim())?'link':'text';return view(add({kind,text:value,name:edge.normalizeNote(value).slice(0,80)||'Text',bytes:Buffer.byteLength(value),signature:edge.contentSignature({kind:'text',text:value}),source}));}
 function excluded(){try{return require('./clipboard-exclusion.cjs')(clipboard).isClipboardExcluded();}catch{return true;}}
 function capture(){if(excluded())throw Error('Zwischenablage ist als privat markiert oder nicht sicher lesbar.');
 const image=clipboard.readImage();if(image&&!image.isEmpty()){const size=image.getSize();if(size.width>8192||size.height>8192||size.width*size.height>4e6)throw Error('Bild zu groß (max. 4 Megapixel).');const png=image.toPNG();if(png.length>model.MAX_FILE)throw Error('Bild zu groß.');return view(add({kind:'image',name:'Zwischenablage-Bild',text:'',preview:image.resize({width:240,height:140}).toDataURL(),content:png,bytes:png.length,signature:edge.contentSignature({kind:'image',width:size.width,height:size.height,bytes:0,imageId:hash(png)}),source:'clipboard'}));}
 return text(clipboard.readText(),'clipboard');}
 async function file(filename,expected=epoch){
 if(typeof filename!=='string'||!path.isAbsolute(filename)||filename.includes('\0'))throw Error('Ungültige Dateiauswahl.');
 const absolute=path.resolve(filename),parsed=path.parse(absolute);let parent=parsed.root;
 for(const part of absolute.slice(parent.length).split(path.sep)){parent=path.join(parent,part);const st=await fsp.lstat(parent);if(st.isSymbolicLink())throw Error('Symbolische Links sind nicht erlaubt.');}
 const handle=await fsp.open(absolute,fs.constants.O_RDONLY|(fs.constants.O_NOFOLLOW||0));let content;
 try{const first=await handle.stat();if(!first.isFile()||first.size>model.MAX_FILE)throw Error('Nur reguläre Dateien bis 16 MB.');content=Buffer.alloc(first.size);let read=0;while(read<content.length){const result=await handle.read(content,read,content.length-read,read);if(!result.bytesRead)throw Error('Datei während Import verändert.');read+=result.bytesRead;}const after=await handle.stat();if(first.size!==after.size||first.mtimeMs!==after.mtimeMs||first.ino!==after.ino)throw Error('Datei während Import verändert.');}finally{await handle.close();}
 if(expected!==epoch)throw Error('Die Sitzung hat sich geändert.');
 return stageBytes(path.basename(absolute).slice(0,200),content,expected);}
 async function stageBytes(name,content,expected=epoch){
 if(typeof name!=='string'||!name||name.length>200||/[\\/:\0]/.test(name)||name==='.'||name==='..'||!(content instanceof Uint8Array)||content.byteLength>model.MAX_FILE)throw Error('Nur ausgewählte Dateiinhalte bis 16 MB mit einfachem Namen.');
 content=Buffer.from(content.buffer,content.byteOffset,content.byteLength);if(expected!==epoch)throw Error('Die Sitzung hat sich geändert.');
 const digest=hash(content),existing=[...items.values()].find(i=>i.signature==='files|'+digest);if(existing)return view(existing);
 if(items.size>=model.MAX_ITEMS||bytes+content.length>model.MAX_BYTES)throw Error('Ablage voll.');
 const target=path.join(privateRoot(),crypto.randomUUID());await fsp.writeFile(target,content,{flag:'wx',mode:0o600});
 if(expected!==epoch){await fsp.unlink(target).catch(()=>{});throw Error('Die Sitzung hat sich geändert.');}
 let preview='';if(content.length>=24&&content.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&content.readUInt32BE(16)>0&&content.readUInt32BE(20)>0&&content.readUInt32BE(16)<=8192&&content.readUInt32BE(20)<=8192&&content.readUInt32BE(16)*content.readUInt32BE(20)<=4e6&&nativeImage){try{const image=nativeImage.createFromBuffer(content),s=image.getSize();if(!image.isEmpty()&&s.width*s.height<=4e6)preview=image.resize({width:240,height:140}).toDataURL();}catch{}}
 try{const added=add({kind:'file',name,bytes:content.length,file:target,preview,signature:edge.contentSignature({kind:'files',paths:[digest]}),source:'selected-file'});if(added.file!==target)await fsp.unlink(target);return view(added);}catch(error){await fsp.unlink(target).catch(()=>{});throw error;}}
 function group(ids,name='Dateistapel'){if(!Array.isArray(ids)||ids.length<2||ids.length>32||new Set(ids).size!==ids.length)throw Error('2–32 verschiedene Dateien auswählen.');const children=ids.map(get);if(children.some(i=>!['file','image'].includes(i.kind)))throw Error('Stapel enthalten Dateien und Bilder.');const used=new Set([...items.values()].flatMap(i=>i.children||[]));if(ids.some(id=>used.has(id)))throw Error('Element ist bereits in einem Stapel.');return view(add({kind:'bundle',name:edge.normalizeNote(name)||'Dateistapel',children:[...ids],signature:'bundle|'+[...ids].sort().join(','),source:'group'}));}
 function children(id){return (get(id).children||[]).map(id=>view(get(id)));}
 async function remove(id){const i=get(id);for(const bundle of items.values())if(bundle.children)bundle.children=bundle.children.filter(c=>c!==id);items.delete(id);bytes-=i.bytes||0;if(i.file)await fsp.unlink(i.file).catch(()=>{});if(i.children)for(const child of i.children)if(items.has(child))await remove(child);}
 function take(bundle,id){const b=get(bundle);if(!b.children?.includes(id))throw Error('Element gehört nicht zum Stapel.');b.children=b.children.filter(c=>c!==id);return view(get(id));}
 function rename(id,name){const n=edge.normalizeNote(name);if(!n)throw Error('Name fehlt.');get(id).name=n;return view(get(id));}
 function favorite(id,value){if(typeof value!=='boolean')throw Error('Ungültiger Favorit.');get(id).favorite=value;return view(get(id));}
 function copy(id){const i=get(id);if(['text','link'].includes(i.kind)){clipboard.writeText(i.text);return {copied:true};}if(i.kind==='image'){clipboard.writeImage(nativeImage.createFromBuffer(i.content));return {copied:true};}throw Error('Dateien über „Herausziehen“ exportieren.');}
 async function contents(id){const i=get(id);if(i.kind==='file')return {name:i.name,bytes:await fsp.readFile(i.file)};if(i.kind==='image')return {name:i.name+'.png',bytes:i.content};if(['text','link'].includes(i.kind))return {name:i.name.slice(0,80)+'.txt',bytes:Buffer.from(i.text)};throw Error('Bitte zuerst ein Stapel-Element entnehmen.');}
 function files(id){const i=get(id),all=i.kind==='bundle'?i.children.map(get):[i];if(all.some(i=>i.kind!=='file'))throw Error('Native Drag-Ausgabe unterstützt importierte Dateien.');return all.map(i=>i.file);}
 async function clear(){epoch++;const previous=root;root=null;items.clear();bytes=0;if(previous)await fsp.rm(previous,{recursive:true,force:true});return list();}
 async function forgetClipboard(){for(const i of [...items.values()])if(['clipboard','own-copy'].includes(i.source)&&items.has(i.id))await remove(i.id);return list();}
 function serial(fn){const started=epoch;const result=queue.catch(()=>{}).then(()=>{if(started!==epoch)throw Error('Die Sitzung hat sich geändert.');return fn(started);});queue=result.catch(()=>{});return result;}
 return Object.freeze({list,text,capture,file,stageBytes,group,children,remove,take,rename,favorite,copy,contents,files,clear,forgetClipboard,serial,diagnostics:()=>({count:items.size,bytes,epoch})});
}
module.exports={create};

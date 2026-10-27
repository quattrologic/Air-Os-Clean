'use strict';
// GPL-3.0 delivery adaptation: upstream symbolic files omit the SVG XML namespace.
// Preserve their original bytes; add only the required namespace to browser exports.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),file=path.join(root,'third_party/tahoe/provenance.json'),p=JSON.parse(fs.readFileSync(file));
const browserExports=[];
for(const item of p.icons.assets.filter(x=>x.key.startsWith('symbolic.'))){
 const original=fs.readFileSync(path.join(root,item.asset),'utf8');
 const svg=original.includes('xmlns=')?original:original.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
 const target='third_party/tahoe/icons/browser/'+path.basename(item.asset);
 fs.mkdirSync(path.dirname(path.join(root,target)),{recursive:true});fs.writeFileSync(path.join(root,target),svg);
 browserExports.push({key:item.key,source:item.asset,asset:target,sha256:crypto.createHash('sha256').update(svg).digest('hex'),license:'GPL-3.0',adaptation:'SVG xmlns only; paths, colors and dimensions unchanged'});
}
p.icons.browserExports=browserExports;fs.writeFileSync(file,JSON.stringify(p,null,2)+'\n');

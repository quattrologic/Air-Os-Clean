'use strict';
// Audited static PWA artifact only: no public deployment, accounts or runtime Node modules.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),site=path.join(root,'dist/pwa'),out=path.join(root,'dist/ipad');
require('./check-pwa-package.cjs').check(site);fs.mkdirSync(out,{recursive:true});
const info=JSON.parse(fs.readFileSync(path.join(site,'BUILD-INFO.json'),'utf8'));if(info.sourceDirty)throw Error('Commit the tested source before packaging a versioned iPad artifact.');if(!/^[0-9a-f]{40}$/.test(info.commit))throw Error('A versioned source checkout is required for the iPad build artifact.');
const name='Air-OS-Ultimate-iPad-'+info.commit.slice(0,12)+'.zip',zip=path.join(out,name);
cp.execFileSync('python3',['-c',"import pathlib,sys,zipfile\nroot=pathlib.Path(sys.argv[1])\nwith zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:\n for p in sorted(root.rglob('*')):\n  if p.is_file():\n   i=zipfile.ZipInfo(p.relative_to(root).as_posix(),(2026,1,1,0,0,0));i.compress_type=zipfile.ZIP_DEFLATED;i.external_attr=0o100644<<16;z.writestr(i,p.read_bytes())\n",site,zip]);
const sha256=crypto.createHash('sha256').update(fs.readFileSync(zip)).digest('hex');fs.writeFileSync(path.join(out,'SHA256SUMS.txt'),sha256+'  '+name+'\n');
fs.writeFileSync(path.join(out,'BUILD-INFO.json'),JSON.stringify({...info,zip:name,bytes:fs.statSync(zip).size,sha256},null,2));
fs.writeFileSync(path.join(out,'INSTALLATION.txt'),'Air-OS Ultimate iPad PWA\nZIP auf einem eigenen vertrauenswürdigen HTTPS-Webhost entpacken. Keine öffentliche Bereitstellung durch diesen Build.\nIn Safari öffnen: Teilen > Zum Home-Bildschirm > als Web-App öffnen.\nEinmal vollständig online laden. Danach lokale Apps offline verwendbar. Browserdaten regelmäßig über iPad-Menü exportieren.\nLokale Bereiche sind kein Passwortschutz. Keine native App-Store-App. Physische iPad-Abnahme separat erforderlich.\n');
console.log(JSON.stringify({name,sha256,bytes:fs.statSync(zip).size,commit:info.commit}));

'use strict';
// Reproducible type erasure only; no TypeScript runtime or Edge-Drop application.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{stripTypeScriptTypes}=require('node:module');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'third_party/edge-drop');
const files=['electron/store/signature.ts','shared/linkText.ts','shared/itemMeta.ts','src/lib/search.ts','electron/preload/internalDragGuard.ts'];
function erase(s){return stripTypeScriptTypes(s,{mode:'strip'}).replace(/^import type .*$/mg,'').replace(/\bexport\s+(?=(?:function|const|let|class)\b)/g,'');}
const names=['contentSignature','isLinkText','linkTitleFromHtml','NOTE_MAX','normalizeNote','joinNotes','noteFromLegacy','isKept','foldText','queryWords','searchText','matchesWords','GUARD_AUTO_IDLE_MS','reduceGuard','isGuarded'];
const output="'use strict';\n// GENERATED from pinned Apache-2.0 Edge-Drop originals. See third_party/edge-drop/NOTICE.\n(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.airEdgeDrop=api;})(typeof window==='object'?window:null,function(){\n"+files.map(f=>'// '+f+'\n'+erase(fs.readFileSync(path.join(dir,f),'utf8'))).join('\n')+'\nreturn Object.freeze({'+names.join(',')+'});\n});\n';
fs.writeFileSync(path.join(root,'src/core/edge-drop.js'),output);
const raw=fs.readFileSync(path.join(dir,'clipboard-exclusion.ts'),'utf8');
fs.writeFileSync(path.join(root,'src/main/clipboard-exclusion.cjs'),"'use strict';\n// Edge-Drop Apache-2.0 original exclusion checks; provider injection only.\nmodule.exports=clipboard=>{\n"+erase(raw)+'\nreturn {isClipboardExcluded};};\n');

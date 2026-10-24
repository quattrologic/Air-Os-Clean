'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('Notes visual overrides cannot leak into Classic or other applications, including responsive rules',()=>{
 const css=fs.readFileSync(require.resolve('../styles.css'),'utf8').split('/* F1: Notes only,')[1];assert.ok(css,'dedicated scoped Notes stylesheet section required');
 const clean=css.slice(css.indexOf('*/')+2).replace(/\/\*[\s\S]*?\*\//g,'');let rules=0;
 for(const match of clean.matchAll(/([^{}]+)\{/g)){
  const selector=match[1].trim();if(selector.startsWith('@media'))continue;
  // All rule branches require both the existing desktop theme and the specific Notes window.
  const branches=[];let depth=0,start=0;for(let i=0;i<selector.length;i++){if(selector[i]==='(')depth++;if(selector[i]===')')depth--;if(selector[i]===','&&depth===0){branches.push(selector.slice(start,i));start=i+1}}branches.push(selector.slice(start));
  for(const branch of branches){assert.match(branch.trim(),/^html\[data-desktop-theme="modern"\] \.air-notes-window(?=[\s.{:]|$)/,branch);rules++}
 }
 assert.ok(rules>0);
});

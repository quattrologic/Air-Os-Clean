/* Explicit text-edit transaction. Native inputs and existing app controllers retain ownership. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.airClipboardEdit=api;})(typeof window==='object'?window:null,()=>{
 async function edit(command,editor,bridge,alive=()=>true){
  if(!['copy','cut','paste'].includes(command)||!bridge||!editor?.matches('input:not([type]),input[type=text],input[type=search],textarea')||editor.disabled||!editor.isConnected||!alive())throw Error('Textaktion nicht verfügbar.');
  if(command!=='copy'&&editor.readOnly)throw Error('Dieses Feld ist schreibgeschützt.');
  const before=editor.value,start=editor.selectionStart,end=editor.selectionEnd,doc=editor.ownerDocument;
  if(!Number.isInteger(start)||!Number.isInteger(end))throw Error('Textauswahl nicht verfügbar.');
  editor.focus();
  const valid=()=>alive()&&editor.isConnected&&editor.value===before&&editor.selectionStart===start&&editor.selectionEnd===end&&doc.activeElement===editor;
  let text='';if(command==='paste')text=await bridge.paste();else{if(start===end)return{changed:false};await bridge.copy(before.slice(start,end));}
  if(!valid())throw Error('Text oder Fokus hat sich geändert. Aktion erneut wählen.');
  if(command==='copy')return{changed:false};
  if(typeof text!=='string')throw Error('Zwischenablage enthält keinen Text.');
  if(editor.maxLength>=0){const max=Math.max(0,editor.maxLength-before.length+(end-start));text=text.slice(0,max).replace(/[\uD800-\uDBFF]$/,'');}
  // Chromium's native edit command preserves its undo stack and input/change semantics.
  if(!doc.execCommand(command==='cut'?'delete':'insertText',false,text)){
   editor.setRangeText(text,start,end,'end');editor.dispatchEvent(new Event('input',{bubbles:true}));
  }
  return{changed:true};
 }
 return Object.freeze({edit});
});

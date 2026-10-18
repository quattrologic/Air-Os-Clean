'use strict';
// Cloud payload boundary for AirWrite: only user-approved glyph profiles.
// No document text, PNG, rendered images or local app state.
const MAX_GLYPHS=300,MAX_POINTS=12000,MAX_BYTES=512*1024;
function validateProfile(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid profile');
 const allowed=['version','id','name','glyphs'];
 if(Object.keys(input).some(k=>!allowed.includes(k)))throw Error('Unexpected profile field');
 if(input.version!==1||typeof input.id!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(input.id))throw Error('Invalid profile version or ID');
 if(typeof input.name!=='string'||!input.name.trim()||input.name.length>80)throw Error('Invalid profile name');
 if(!input.glyphs||typeof input.glyphs!=='object'||Array.isArray(input.glyphs))throw Error('Invalid glyphs');
 const entries=Object.entries(input.glyphs);
 if(entries.length>MAX_GLYPHS)throw Error('Too many glyphs');
 let total=0;
 const glyphs={};
 for(const [character,strokes] of entries){
  if([...character].length!==1||!Array.isArray(strokes)||strokes.length>100)throw Error('Invalid glyph');
  glyphs[character]=strokes.map(stroke=>{
   if(!Array.isArray(stroke)||stroke.length>1000)throw Error('Invalid stroke');
   total+=stroke.length;if(total>MAX_POINTS)throw Error('Too many points');
   return stroke.map(p=>{
    if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).some(k=>!['x','y','pressure'].includes(k))||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>1||p.y<0||p.y>1||p.pressure!==undefined&&(!Number.isFinite(p.pressure)||p.pressure<0||p.pressure>1))throw Error('Invalid point');
    return p.pressure===undefined?{x:p.x,y:p.y}:{x:p.x,y:p.y,pressure:p.pressure};
   });
  });
 }
 const output={version:1,id:input.id,name:input.name.trim(),glyphs};
 if(Buffer.byteLength(JSON.stringify(output),'utf8')>MAX_BYTES)throw Error('Profile too large');
 return output;
}
function prepareProfileUpload(profile,{enabled=false,profileIds=[]}={}){
 if(!enabled||!Array.isArray(profileIds)||!profileIds.includes(profile?.id))throw Error('Profile sync not approved');
 return validateProfile(profile);
}
module.exports={validateProfile,prepareProfileUpload};

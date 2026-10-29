'use strict';
// Optional browser surface for the existing Air Music transport; never an audio engine.
(() => {
 const session=navigator.mediaSession;if(!session||!window.MediaMetadata)return;
 const events=new AbortController(),signal=events.signal;let signature='',position=-1;
 const transport=()=>window.airMusic?.transport;
 function refresh(){const s=transport()?.snapshot();if(!s?.available){session.metadata=null;session.playbackState='none';signature='';position=-1;return;}
  const next=JSON.stringify([s.title,s.artist,s.album,s.artwork]);if(next!==signature){signature=next;session.metadata=new MediaMetadata({title:s.title,artist:s.artist,album:s.album,artwork:s.artwork?[{src:s.artwork}]:[]});}
  session.playbackState=s.playing?'playing':'paused';if(session.setPositionState&&s.duration>0&&Number.isFinite(s.duration)&&Math.floor(s.position)!==position){position=Math.floor(s.position);try{session.setPositionState({duration:s.duration,playbackRate:1,position:Math.min(s.duration,Math.max(0,s.position))});}catch{}}
 }
 const actions={play:()=>{if(!transport()?.snapshot().playing)transport()?.act('toggle');},pause:()=>{if(transport()?.snapshot().playing)transport()?.act('toggle');},previoustrack:()=>transport()?.act('previous'),nexttrack:()=>transport()?.act('next'),seekto:e=>{const s=transport()?.snapshot();if(s?.duration>0&&Number.isFinite(e.seekTime))transport().act('seek',Math.min(1,Math.max(0,e.seekTime/s.duration)));}};
 for(const [action,fn]of Object.entries(actions))try{session.setActionHandler(action,fn);}catch{}
 document.addEventListener('air-music-changed',refresh,{signal});
 const stop=()=>{events.abort();session.metadata=null;session.playbackState='none';for(const action of Object.keys(actions))try{session.setActionHandler(action,null);}catch{}};
 document.addEventListener('air-profile-changing',stop,{once:true});window.addEventListener('pagehide',stop,{once:true});refresh();
})();

'use strict';
// Presentation adapter over existing Settings nodes and handlers; no preference store.
window.airTahoeSettings={mount(win){
 const root=win.querySelector('.air-settings');if(!root||root.dataset.tahoeMounted)return;
 root.dataset.tahoeMounted='true';const original=[...root.children],events=new AbortController();
 const groups=[['appearance','Darstellung','settings',['.air-settings-section','#air-custom-wallpaper','#accent-color','#air-desktop-theme','#air-glass-family']],['dock','Dock','finder',['#air-dock-theme','#air-dock-size']],['accessibility','Bedienung','calendar',['#reduce-glass','#air-reduce-motion','#air-clock-24']],['cloud','Air Cloud','notes',['.air-cloud-panel']]].map(([id,label,icon,selectors])=>({id,label,icon,nodes:selectors.map(s=>{const n=root.querySelector(s);return n?.closest('.setting-row')||n;}).filter(Boolean)})).filter(g=>g.nodes.length);
 const nav=document.createElement('nav'),main=document.createElement('main'),toolbar=document.createElement('header'),search=document.createElement('input'),empty=document.createElement('p');
 nav.className='tahoe-settings-nav';nav.setAttribute('aria-label','Einstellungskategorien');main.className='tahoe-settings-main';toolbar.className='tahoe-toolbar';search.type='search';search.placeholder='Einstellungen suchen';search.setAttribute('aria-label','Einstellungen suchen');toolbar.append(search);empty.textContent='Keine passenden Einstellungen.';empty.className='tahoe-empty';empty.hidden=true;
 const footer=document.createElement('footer');footer.className='tahoe-settings-footer';
 let active=groups[0].id,installed=false;
 const sections=groups.map(g=>{const section=document.createElement('section'),heading=document.createElement('h2'),b=document.createElement('button'),icon=document.createElement('span'),label=document.createElement('span');section.className='tahoe-settings-group';heading.textContent=g.label;section.append(heading);b.type='button';b.dataset.settingsCategory=g.id;icon.className='tahoe-category-icon';paintAirAppIcon(icon,g.icon);label.textContent=g.label;b.append(icon,label);b.onclick=()=>{active=g.id;search.value='';render();main.scrollTop=0;};nav.append(b);main.append(section);return section;});
 function render(){const query=search.value.trim().toLocaleLowerCase('de-DE');let count=0;groups.forEach((g,i)=>{let visible=0;for(const n of g.nodes){n.hidden=!!query&&!n.textContent.toLocaleLowerCase('de-DE').includes(query);if(!n.hidden)visible++;}sections[i].hidden=query?!visible:g.id!==active;if(!sections[i].hidden)count++;nav.children[i].setAttribute('aria-pressed',String(!query&&g.id===active));});empty.hidden=!!count;}
 search.addEventListener('input',render,{signal:events.signal});
 function sync(){const modern=document.documentElement.dataset.desktopTheme==='modern';if(modern===installed)return;installed=modern;
  if(modern){root.classList.add('tahoe-settings');root.replaceChildren(nav,main);main.prepend(toolbar);const heading=original.find(n=>n.classList.contains('app-heading'));if(heading)toolbar.prepend(heading);groups.forEach((g,i)=>sections[i].append(...g.nodes));main.append(empty,footer);for(const n of original)if(!n.classList.contains('app-heading')&&!groups.some(g=>g.nodes.includes(n)))footer.append(n);root.querySelectorAll('.setting-row input[type=checkbox]').forEach(el=>{el.setAttribute('role','switch');if(!el.hasAttribute('aria-label'))el.setAttribute('aria-label',el.closest('.setting-row').querySelector('strong')?.textContent||'Einstellung');});render();}
  else{groups.forEach(g=>g.nodes.forEach(n=>n.hidden=false));root.classList.remove('tahoe-settings');root.replaceChildren(...original);}
 }
 const observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-desktop-theme']});sync();
 function dispose(){observer.disconnect();events.abort();document.removeEventListener('air-profile-changing',dispose);window.removeEventListener('pagehide',dispose);}
 win.querySelector('.close').addEventListener('click',dispose,{once:true});document.addEventListener('air-profile-changing',dispose,{once:true});window.addEventListener('pagehide',dispose,{once:true});
}};

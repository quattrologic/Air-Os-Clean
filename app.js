const $ = (s, root=document) => root.querySelector(s);
const windows = $("#windows");
const openApps = new Map();
const lifecycle=window.airAppLifecycle;
// Reflect focus without replacing dock buttons or their existing launch handlers.
lifecycle?.onChange(({id,state})=>{
 const buttons=document.querySelectorAll('.dock-app[data-app]');
 if(state==='focused'||state==='maximized')buttons.forEach(button=>button.classList.toggle('is-active',button.dataset.app===id));
 else if(state==='closed'||state==='minimized')buttons.forEach(button=>{if(button.dataset.app===id)button.classList.remove('is-active')});
});
let zIndex = 2;
let toastTimer;
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2200)}
function updateClock(){const d=new Date();$("#clock").textContent=d.toLocaleDateString("de-DE",{weekday:"short",day:"numeric",month:"short"})+"  "+d.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}
updateClock();setInterval(updateClock,15000);
const appNames=window.airAppRegistry.names;
const iconClasses=window.airAppRegistry.iconClasses;
const iconGlyphs=window.airAppRegistry.iconGlyphs;

const vectorIcon = {
 airwrite: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="awSoft" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e7f9ff"/><stop offset=".58" stop-color="#c4e2ff"/><stop offset="1" stop-color="#a9c9fa"/></linearGradient><linearGradient id="awPaper" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#eaf3ff"/></linearGradient><linearGradient id="awBluePen" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#a3d7ff"/><stop offset=".5" stop-color="#5eacfb"/><stop offset="1" stop-color="#438deb"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="14" fill="url(#awSoft)"/><rect x="12" y="12" width="39" height="41" rx="9" fill="url(#awPaper)" stroke="#d4e8fc" stroke-width=".8"/><path d="M19 23h23M19 30h20M19 37h16" stroke="#b7d3f2" stroke-width="2.6" stroke-linecap="round"/><g transform="rotate(35 41 35)"><rect x="37.2" y="13" width="8.4" height="33" rx="4.2" fill="url(#awBluePen)"/><rect x="37.2" y="13" width="8.4" height="5" rx="3" fill="#659ff4"/><rect x="43" y="20" width="2.3" height="16" rx="1.15" fill="#edf5ff"/><path d="M37.2 45h8.4l-4.2 9Z" fill="#c4cbd6"/><path d="m39.9 51 1.5 3 1.5-3Z" fill="#39465b"/></g></svg>`,
 finder: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="finA" x2="0" y2="1"><stop stop-color="#6de5ff"/><stop offset="1" stop-color="#1686d8"/></linearGradient><linearGradient id="finB" x2="0" y2="1"><stop stop-color="#e9f9ff"/><stop offset="1" stop-color="#8cd9f8"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="14" fill="#1c8fe2"/><path d="M2 16A14 14 0 0 1 16 2h16v60H16A14 14 0 0 1 2 48Z" fill="url(#finB)"/><path d="M32 2h16A14 14 0 0 1 62 16v32a14 14 0 0 1-14 14H32Z" fill="url(#finA)"/><path d="M19 24v-5m26 5v-5" stroke="#1f456d" stroke-width="3.2" stroke-linecap="round"/><path d="M13 39q7 4 16 0m6 0q9 4 16 0" fill="none" stroke="#16466f" stroke-width="2.3" stroke-linecap="round"/><path d="M29 41 24 49m11-8 5 8" stroke="#16466f" stroke-width="2" stroke-linecap="round"/></svg>`,
 browser: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="saf" x2="0" y2="1"><stop stop-color="#2fe6ff"/><stop offset=".52" stop-color="#1686e4"/><stop offset="1" stop-color="#0645a7"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="15" fill="#f7fbff"/><circle cx="32" cy="32" r="27" fill="url(#saf)" stroke="#dcefff" stroke-width="1.5"/><circle cx="32" cy="32" r="22" fill="none" stroke="#c5edff" stroke-width="1.2"/><path d="M32 7 37 30 57 32 35 36 32 57 28 35 7 32 29 29Z" fill="#fff"/><path d="m32 32 18-18-7 24-11-6Z" fill="#ed4c55"/><circle cx="32" cy="32" r="3" fill="#fff"/></svg>`,
 mail: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="mailbg" x2="0" y2="1"><stop stop-color="#42c8ff"/><stop offset="1" stop-color="#0475e7"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="14" fill="url(#mailbg)"/><rect x="8" y="17" width="48" height="32" rx="5" fill="#eaf8ff"/><path d="m9 20 23 18 23-18" fill="none" stroke="#98d8ff" stroke-width="3"/><path d="m9 46 16-14m30 14L39 32" fill="none" stroke="#b6dfff" stroke-width="2"/></svg>`,
 calendar: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="3" y="2" width="58" height="60" rx="11" fill="#f9fbff" stroke="#d4dce8"/><path d="M3 13A11 11 0 0 1 14 2h36a11 11 0 0 1 11 11v10H3Z" fill="#f04448"/><text x="32" y="17" fill="#fff" font-size="10" font-family="Arial" font-weight="700" text-anchor="middle">DI</text><text x="32" y="50" fill="#34435b" font-size="32" font-family="Arial" font-weight="300" text-anchor="middle">31</text></svg>`,
 notes: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="3" y="2" width="58" height="60" rx="10" fill="#fff" stroke="#e0e3e8"/><path d="M3 12A10 10 0 0 1 13 2h38a10 10 0 0 1 10 10v8H3Z" fill="#ffd44f"/><path d="M4 26h56M4 35h56M4 44h56M4 53h56" stroke="#dfe5ec" stroke-width="2"/><path d="M4 22h56" stroke="#fff0a6" stroke-width="2"/></svg>`,
 photos: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="60" height="60" rx="15" fill="#fff"/><g transform="translate(32 32)"><ellipse cy="-14" rx="8" ry="13" fill="#f05a55"/><ellipse transform="rotate(45)" cy="-14" rx="8" ry="13" fill="#f6a23c"/><ellipse transform="rotate(90)" cy="-14" rx="8" ry="13" fill="#f8d548"/><ellipse transform="rotate(135)" cy="-14" rx="8" ry="13" fill="#7ecf83"/><ellipse transform="rotate(180)" cy="-14" rx="8" ry="13" fill="#4eb9d8"/><ellipse transform="rotate(225)" cy="-14" rx="8" ry="13" fill="#6d91e9"/><ellipse transform="rotate(270)" cy="-14" rx="8" ry="13" fill="#a783db"/><ellipse transform="rotate(315)" cy="-14" rx="8" ry="13" fill="#ef81b0"/><circle r="6" fill="#f8f5ee"/></g></svg>`,
 music: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="airMusicPodBg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#edf8ff"/><stop offset="1" stop-color="#bddaf4"/></linearGradient><linearGradient id="airMusicPodBody" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#e1ebf6"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="14" fill="url(#airMusicPodBg)"/><rect x="17" y="6" width="30" height="52" rx="6" fill="url(#airMusicPodBody)" stroke="#8da9c2" stroke-width="1.2"/><rect x="21" y="11" width="22" height="20" rx="2.5" fill="#c9e8f8"/><path d="M21 24 Q32 16 43 24 V29 H21Z" fill="#83c9ed" opacity=".55"/><path d="M28 17v8m0-8 7-2v8" fill="none" stroke="#2489c9" stroke-width="1.8" stroke-linecap="round"/><circle cx="27" cy="25" r="2" fill="#2489c9"/><circle cx="34" cy="23" r="2" fill="#2489c9"/><circle cx="32" cy="43" r="11" fill="#f7fbff" stroke="#b4c7da" stroke-width="1"/><circle cx="32" cy="43" r="4" fill="#dcebf6"/><path d="M32 34v3M32 49v3M23 43h3M38 43h3" stroke="#7b9cb8" stroke-width="1.6" stroke-linecap="round"/><path d="m30.7 40.5 4 2.5-4 2.5Z" fill="#408dbd"/></svg>`,
 spotify: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="60" height="60" rx="14" fill="#18cf70"/><path d="M15 24c12-4 25-2 35 4" fill="none" stroke="#062d22" stroke-width="4.5" stroke-linecap="round"/><path d="M17 32c10-3 21-1 30 4" fill="none" stroke="#062d22" stroke-width="3.7" stroke-linecap="round"/><path d="M19 40c8-2 16 0 23 3" fill="none" stroke="#062d22" stroke-width="3.1" stroke-linecap="round"/></svg>`,
 settings: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="gear" x2="0" y2="1"><stop stop-color="#f7f9fc"/><stop offset="1" stop-color="#9ca9bb"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="14" fill="url(#gear)"/><g transform="translate(32 32)" fill="#717d8f"><path d="M-5-27h10l2 7 6 2 6-4 7 7-4 6 2 6 7 2v10l-7 2-2 6 4 6-7 7-6-4-6 2-2 7h-10l-2-7-6-2-6 4-7-7 4-6-2-6-7-2V-1l7-2 2-6-4-6 7-7 6 4 6-2Z" transform="scale(.82)"/><circle r="12" fill="#dce2ea"/><circle r="7" fill="#69778b"/></g></svg>`,
 downloads: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 9v34m-14-14 14 14 14-14" fill="none" stroke="#1889e7" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 trash: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="bin" x2="1" y2="0"><stop stop-color="#d2e0f0" stop-opacity=".76"/><stop offset=".35" stop-color="#fff" stop-opacity=".95"/><stop offset=".72" stop-color="#9cadc4" stop-opacity=".85"/><stop offset="1" stop-color="#eaf2fb" stop-opacity=".95"/></linearGradient></defs><path d="M17 16h30l-3 39a5 5 0 0 1-5 4H25a5 5 0 0 1-5-4Z" fill="url(#bin)" stroke="#c9d7e7" stroke-width="1.5"/><path d="M13 13h38v4H13z" rx="2" fill="#eef5fc" stroke="#b5c5d9"/><path d="M25 9h14l3 4H22Z" fill="#e9f1fa" stroke="#b5c5d9"/><path d="M27 22v29m10-29v29" stroke="#adbed2" stroke-width="1.2" opacity=".8"/></svg>`,
 computer: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="mon" x2="0" y2="1"><stop stop-color="#c9d5e2"/><stop offset="1" stop-color="#6a7d95"/></linearGradient><linearGradient id="screen" x2="0" y2="1"><stop stop-color="#6dd5ff"/><stop offset="1" stop-color="#1684d3"/></linearGradient></defs><path d="M12 5h40q4 0 4 4v32H8V9q0-4 4-4Z" fill="url(#mon)" stroke="#8c9caf"/><rect x="11" y="8" width="42" height="29" rx="2" fill="url(#screen)" stroke="#e4f2ff" stroke-width="1.5"/><path d="M8 41h48l-6 12H14Z" fill="url(#mon)" stroke="#8c9caf"/><path d="M25 46h14l3 5H22Z" fill="#354b67"/><path d="M29 42h6v2h-6z" fill="#e9f0f8"/></svg>`,
 folder: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="fol" x2="0" y2="1"><stop stop-color="#83dcff"/><stop offset="1" stop-color="#1798ec"/></linearGradient></defs><path d="M5 14q0-5 5-5h17l7 7h20q5 0 5 5v28q0 5-5 5H10q-5 0-5-5Z" fill="url(#fol)" stroke="#42a9ed" stroke-width="1.4"/><path d="M5 22q0-4 5-4h44q5 0 5 5v3H5Z" fill="#b5edff" opacity=".72"/><path d="M7 28h50" stroke="#8ce0ff" stroke-width="1.5"/></svg>`,
 pictures: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="folp" x2="0" y2="1"><stop stop-color="#79d6ff"/><stop offset="1" stop-color="#138ce0"/></linearGradient></defs><path d="M5 14q0-5 5-5h17l7 7h20q5 0 5 5v28q0 5-5 5H10q-5 0-5-5Z" fill="url(#folp)" stroke="#36a4eb" stroke-width="1.4"/><path d="M5 23h54" stroke="#b4edff" stroke-width="2"/><path d="m16 43 8-12 8 8 6-5 11 12H15Z" fill="#e7f9ff"/><circle cx="42" cy="29" r="3.2" fill="#e7f9ff"/></svg>`
};
vectorIcon.aircard = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="aircardbg" x2="0" y2="1"><stop stop-color="#b8a6ff"/><stop offset="1" stop-color="#6553d9"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="15" fill="url(#aircardbg)"/><rect x="9" y="15" width="46" height="34" rx="7" fill="#fff" fill-opacity=".94"/><rect x="14" y="22" width="10" height="8" rx="2" fill="#9ba9c7"/><path d="M14 36h24M14 41h16" stroke="#b7c2d6" stroke-width="2.5" stroke-linecap="round"/><circle cx="46" cy="40" r="4" fill="#7461dc"/></svg>';
vectorIcon.tagesschau = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="tsblue" x2="0" y2="1"><stop stop-color="#1475c9"/><stop offset="1" stop-color="#04376f"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="13" fill="url(#tsblue)"/><path d="M2 18A16 16 0 0 1 18 2h28A16 16 0 0 1 62 18v1H2Z" fill="#41b5f2" opacity=".72"/><text x="32" y="41" text-anchor="middle" font-family="Arial,sans-serif" font-size="25" font-weight="800" letter-spacing="-1.5" fill="#fff">ts</text><path d="M15 48h34" stroke="#8dd8ff" stroke-width="2.5" stroke-linecap="round"/></svg>';
vectorIcon.weather = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="weatherbg" x2="0" y2="1"><stop stop-color="#8bd4ff"/><stop offset="1" stop-color="#3d9de8"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="14" fill="url(#weatherbg)"/><circle cx="24" cy="23" r="9" fill="#ffd95c"/><g stroke="#ffd95c" stroke-width="2.5" stroke-linecap="round"><path d="M24 8v4M24 34v4M9 23h4M35 23h4M13 12l3 3M32 31l3 3M13 34l3-3M32 15l3-3"/></g><path d="M17 46a9 9 0 0 1 1-18 13 13 0 0 1 25-2 10 10 0 1 1 3 20Z" fill="#fff" stroke="#e4f5ff" stroke-width="1.5"/><path d="M25 37h16M23 42h12" stroke="#c6e8ff" stroke-width="2" stroke-linecap="round"/></svg>';
vectorIcon.football = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="ballbg" x2="0" y2="1"><stop stop-color="#a4d8ff"/><stop offset="1" stop-color="#438fe0"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="14" fill="url(#ballbg)"/><circle cx="32" cy="32" r="23" fill="#fff" stroke="#dceaf8" stroke-width="1.5"/><path d="m32 19 9 6-3 11H26l-3-11Z" fill="#253d5c"/><path d="m32 19 0-8M41 25l9-4M38 36l5 9M26 36l-5 9M23 25l-9-4" fill="none" stroke="#253d5c" stroke-width="2.5" stroke-linecap="round"/><path d="m14 21 5-8 8 1M50 21l-5-8-8 1M43 45l-1 8-8 2M21 45l1 8 8 2" fill="none" stroke="#253d5c" stroke-width="2.5" stroke-linecap="round"/></svg>';
vectorIcon.calculator = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="calc-bg" x2="0" y2="1"><stop stop-color="#5a6577"/><stop offset="1" stop-color="#27354b"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="13" fill="url(#calc-bg)"/><rect x="11" y="8" width="42" height="15" rx="3" fill="#d8f4f1"/><text x="48" y="19" text-anchor="end" font-size="10" font-family="Arial,sans-serif" fill="#214b51">123</text><g fill="#f2f5fa"><rect x="11" y="29" width="8" height="8" rx="2"/><rect x="23" y="29" width="8" height="8" rx="2"/><rect x="35" y="29" width="8" height="8" rx="2"/><rect x="11" y="41" width="8" height="8" rx="2"/><rect x="23" y="41" width="8" height="8" rx="2"/><rect x="35" y="41" width="8" height="8" rx="2"/></g><rect x="45" y="29" width="8" height="20" rx="2" fill="#ffb84d"/><rect x="11" y="53" width="32" height="4" rx="2" fill="#f2f5fa"/></svg>';
vectorIcon.stocks = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="stockbg" x2="0" y2="1"><stop stop-color="#f8fbff"/><stop offset="1" stop-color="#dce8f8"/></linearGradient><linearGradient id="stockline" x2="0" y2="1"><stop stop-color="#35c997"/><stop offset="1" stop-color="#128567"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="14" fill="url(#stockbg)" stroke="#c7d6e8"/><path d="M11 50H53" stroke="#aec2d8" stroke-width="2" stroke-linecap="round"/><rect x="12" y="35" width="7" height="15" rx="2" fill="#7eaae5"/><rect x="24" y="27" width="7" height="23" rx="2" fill="#578edb"/><rect x="36" y="19" width="7" height="31" rx="2" fill="#3f7ccd"/><path d="m11 31 11-8 9 3 10-13 11 3" fill="none" stroke="url(#stockline)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="m45 16 7 0-1 7" fill="none" stroke="#128567" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function paintAppIcons(root=document){
  const lookup={"translator-icon":"translator","ai-icon":"ai", "finder-icon":"finder","browser-icon":"browser","tagesschau-icon":"tagesschau","mail-icon":"mail","calendar-icon":"calendar","notes-icon":"notes","reminders-icon":"reminders","photos-icon":"photos","music-icon":"music","spotify-icon":"spotify","aircard-icon":"aircard","settings-icon":"settings","downloads-icon":"downloads","trash-icon":"trash","weather-icon":"weather","football-icon":"football","stocks-icon":"stocks","calc-icon":"calculator","airwrite-icon":"airwrite","launchpad-icon":"launchpad","store-icon":"store" };
  Object.entries(lookup).forEach(([cls,id])=>root.querySelectorAll("."+cls).forEach(el=>{el.innerHTML=vectorIcon[id]||vectorIcon.folder;}));
  root.querySelectorAll("[data-art]").forEach(el=>{const art=vectorIcon[el.dataset.art];if(art)el.innerHTML=art;});
}
paintAppIcons();

// Air Home is a trusted built-in view, using the same window/lifecycle as other apps.
function airHomeBody(){
 return `<section class="air-home" aria-label="Air Home"><nav class="air-home-nav" aria-label="Air-Home-Navigation"><span class="air-home-brand">AIR HOME</span><button type="button" data-home-action="home" aria-current="page"><span aria-hidden="true">⌂</span>Home</button><button type="button" data-home-action="launchpad"><span aria-hidden="true">▦</span>Apps</button><button type="button" data-home-action="finder"><span aria-hidden="true">▱</span>Dateien</button><button type="button" data-home-action="settings"><span aria-hidden="true">⚙︎</span>Einstellungen</button><p class="air-home-nav-note">Dein Air-OS-Arbeitsplatz</p></nav><main class="air-home-main" tabindex="-1"><div class="air-home-columns"><div class="air-home-column"><section class="air-home-card air-home-welcome"><h1>Willkommen zu Hause.</h1><p>Dein Platz in Air-OS.</p></section><section class="air-home-card air-home-inbox"><h2>Notizen</h2><p class="air-home-notes-status" role="status">Notizen werden geladen …</p><ul class="air-home-notes-list" aria-label="Zuletzt bearbeitete Notizen"></ul><button type="button" class="air-home-notes-retry" hidden>Erneut laden</button><button type="button" class="air-home-notes-open">Alle Notizen öffnen</button></section><section class="air-home-card air-home-tint"><h2>Raum für Ideen.</h2><p>Demnächst</p></section></div><div class="air-home-column"><section class="air-home-card air-home-horizon"><h2>Vorhaben</h2><p>Platz für deine nächsten Schritte.</p><p class="air-home-empty">Projekt-Widget · Demnächst</p></section><section class="air-home-card air-home-focus"><h2>Fokus</h2><p>Timer · Demnächst</p></section><section class="air-home-card air-home-due"><h2>Heute</h2><p>Kalender-Widget · Demnächst</p></section></div><div class="air-home-column"><section class="air-home-card air-home-preview"><h2>Deine Perspektive</h2><p>Medien-Widget · Demnächst</p></section><section class="air-home-card air-home-projects"><h2>Aktuelle Projekte</h2><p>Deine Arbeit im Überblick.</p><p class="air-home-empty">Projektübersicht demnächst verfügbar.</p></section></div></div></main></section>`;
}
function mountAirHome(win){
 window.airHomeNotes?.mount(win);
 win.querySelectorAll('[data-home-action]').forEach(button=>button.addEventListener('click',()=>{
  const id=button.dataset.homeAction;
  if(id==='home'){win.querySelector('.air-home-main').focus();return}
  if(['launchpad','finder','settings'].includes(id))openApp(id);
 }));
 // Initial bounds in viewport coordinates; existing drag/resize/maximize owns them afterwards.
 const host=appWindowHostRect(),small=innerWidth<=700;
 const width=small?Math.min(innerWidth-24,host.width):Math.min(innerWidth*1522/1920,host.width);
 const height=small?Math.max(220,Math.min(innerHeight-170,host.height)):Math.min(innerHeight*849/1080,host.height);
 setWindowToViewportRect(win,{left:small?12:innerWidth*200/1920,top:small?Math.max(host.top,62):innerHeight*103/1080,width,height});
}

function appBody(id){
 if(id==='home')return airHomeBody();
 if(id==='reminders')return window.airReminders?.body()||'<p>Erinnerungen laden …</p>';
 if(id==='store')return window.airAppStore?.body()||'<p>App Store lädt …</p>';
 if(id==='launchpad')return window.airLaunchpad?.body()||'<p>Launchpad lädt …</p>';
 if((id==="translator"||id==="ai") && window.airExtraApps)return window.airExtraApps.body(id);
  if(id==="airwrite" && window.airWriteApp) return window.airWriteApp.body();
  if(id==="aircard" && window.airCardLiteApp) return window.airCardLiteApp.body();
  if(id==="tagesschau")return '<div class="tagesschau-app"><header class="ts-app-header"><div class="ts-brand"><span class="ts-brand-mark">ts</span><span><strong>tagesschau</strong><small>Nachrichten</small></span></div><button class="ts-refresh" data-ts-refresh title="Aktualisieren">↻ Aktualisieren</button></header><nav class="ts-sections" aria-label="Nachrichtenbereiche"><button class="active" data-news-section="homepage">Übersicht</button><button data-news-section="inland">Inland</button><button data-news-section="ausland">Ausland</button><button data-news-section="wirtschaft">Wirtschaft</button><button data-news-section="wissen">Wissen</button><button data-news-section="sport">Sport</button></nav><div class="ts-status" id="ts-status"><span class="ts-pulse"></span> Aktuelle Meldungen werden geladen …</div><main class="ts-view" id="ts-view"><div class="ts-loading"><span class="ts-spinner"></span><span>Nachrichten werden geladen …</span></div></main><footer class="ts-footer">Quelle: ARD-aktuell / tagesschau.de · Live-Meldungen</footer></div>';
  if(id==="finder")return `<div class="finder-app"><aside class="finder-sidebar"><div class="sidebar-label">Favoriten</div><button class="sidebar-link active" data-folder="Air-OS"><span>☁</span> Air-OS</button><button class="sidebar-link" data-folder="Dokumente"><span>▰</span> Dokumente</button><button class="sidebar-link" data-folder="Bilder"><span>▧</span> Bilder</button><button class="sidebar-link" data-folder="Musik"><span>♫</span> Musik</button><button class="sidebar-link" data-folder="Downloads"><span>↓</span> Downloads</button><div class="sidebar-label">Geräte</div><button class="sidebar-link" data-folder="Dieser Mac"><span>▣</span> Dieser Mac</button><button class="sidebar-link" data-folder="Netzwerk"><span>◎</span> Netzwerk</button></aside><section class="finder-main"><div class="finder-toolbar"><button class="toolbar-button" data-folder="Zurück">‹</button><button class="toolbar-button" data-folder="Vorwärts">›</button><div class="finder-path">▰ &nbsp; Dokumente</div><input class="finder-search" id="finder-search" placeholder="⌕ Suchen"></div><table class="file-table"><thead><tr><th style="width:48%">Name</th><th style="width:24%">Art</th><th>Geändert</th></tr></thead><tbody id="finder-files"><tr data-file="Arbeit"><td>📁　Arbeit</td><td>Ordner</td><td>12.05.2025</td></tr><tr data-file="Privat"><td>📁　Privat</td><td>Ordner</td><td>10.05.2025</td></tr><tr data-file="Reisen"><td>📁　Reisen</td><td>Ordner</td><td>08.05.2025</td></tr><tr data-file="Projekte"><td>📁　Projekte</td><td>Ordner</td><td>06.05.2025</td></tr><tr data-file="Notizen.txt"><td>▤　Notizen.txt</td><td>Textdatei</td><td>04.05.2025</td></tr><tr data-file="IMG_0423.jpg"><td>▧　IMG_0423.jpg</td><td>Bild</td><td>03.05.2025</td></tr><tr data-file="Report.pdf"><td>▤　Report.pdf</td><td>PDF-Dokument</td><td>01.05.2025</td></tr><tr data-file="Budget.xlsx"><td>▦　Budget.xlsx</td><td>Tabelle</td><td>28.04.2025</td></tr></tbody></table><div class="finder-foot">8 Objekte · Beispielinhalte, keine echten Dateien</div></section></div>`;
  if(id==="browser")return `<div class="browser-hero"><div class="browser-logo">Air</div><h2>Was möchtest du heute entdecken?</h2><p>Ein ruhiger Startpunkt für das Web.</p></div><form class="browser-bar" id="browser-form"><input id="browser-query" placeholder="Suchen oder Adresse eingeben"><button>Los</button></form><div class="browser-shortcuts"><button class="browser-shortcut" data-url="https://www.wikipedia.org"><span>🌐</span><strong>Wikipedia</strong></button><button class="browser-shortcut" data-url="https://www.tagesschau.de"><span>📰</span><strong>Nachrichten</strong></button><button class="browser-shortcut" data-url="https://www.github.com"><span>⌘</span><strong>GitHub</strong></button></div><div class="app-notice">Externe Seiten öffnen in deinem Standardbrowser.</div>`;
  if(id==="mail")return `<div class="app-heading"><h2>Mail</h2><p>Alles Wichtige in einem klaren Posteingang.</p></div><div class="app-grid"><div class="app-tile"><strong>Willkommen bei Air-OS</strong><small>Air-OS Team · Heute</small><p>Dein Desktop ist bereit. Dies ist eine Beispiel-Mail.</p></div><div class="app-tile"><strong>Wochenübersicht</strong><small>Notizen · Gestern</small><p>Eine Demo-Nachricht für die Vorschau.</p></div></div><div class="app-notice">Demo-Postfach – kein E-Mail-Konto verbunden.</div>`;
  if(id==="calendar")return `<div class="app-heading"><h2>Kalender</h2><p>Deine Woche auf einen Blick.</p></div><div class="app-grid"><div class="app-tile"><small>MO · 12</small><strong>Fokuszeit</strong><small>09:00–10:30</small></div><div class="app-tile"><small>DI · 13</small><strong>Projekt-Check-in</strong><small>11:00–11:30</small></div><div class="app-tile"><small>MI · 14</small><strong>Freier Nachmittag</strong><small>Keine Termine</small></div><div class="app-tile"><small>DO · 15</small><strong>Design Review</strong><small>14:00–15:00</small></div></div><div class="app-notice">Beispieltermine – nicht synchronisiert.</div>`;
  if(id==="photos")return `<div class="app-heading"><h2>Fotos</h2><p>Momente, gesammelt an einem Ort.</p></div><div class="app-grid photo-grid"><div class="photo-card photo-one"><span>🌄</span><strong>Bergmorgen</strong></div><div class="photo-card photo-two"><span>🌊</span><strong>Am Meer</strong></div><div class="photo-card photo-three"><span>🌿</span><strong>Grüne Wege</strong></div><div class="photo-card photo-four"><span>🌇</span><strong>Abendlicht</strong></div></div><div class="app-notice">Platzhalterbilder – keine Fotos importiert.</div>`;
  if(id==="music")return `<div class="music-hero"><div class="weather-kicker" style="color:#f4eaff">AIR MUSIC · MIX</div><h2>Ein bisschen Ruhe.</h2><p>Demo-Oberfläche für deine Musikbibliothek.</p><button class="primary-button" id="music-play">▶ Wiedergabe</button></div><div class="track-row"><span class="track-cover">♫</span><span class="track-main"><strong>Morning Light</strong><small>Air-OS Sessions · Demo</small></span><span>2:48</span></div><div class="track-row"><span class="track-cover">♪</span><span class="track-main"><strong>Blue Horizon</strong><small>Air-OS Sessions · Demo</small></span><span>3:21</span></div><div class="app-notice">Kein echtes Audio verbunden.</div>`;
  if(id==="notes")return `<div class="note-layout air-notes"><aside class="note-list"><div class="note-list-title">Notizen <button type="button" id="new-note" aria-label="Neue Notiz">＋</button></div><div id="air-note-list"></div></aside><section class="note-workspace"><input id="note-title" class="note-title-input" placeholder="Titel"><textarea id="note-body" class="note-editor" placeholder="Schreibe deine Gedanken auf …"></textarea><div class="note-actions"><span class="muted" id="note-status">Lokal auf diesem Gerät</span><button class="secondary-button" id="delete-note">Löschen</button><button class="secondary-button" id="save-note">Sichern</button></div></section></div>`;
  if(id==="weather")return `<div class="weather-live"><div class="app-heading"><h2>Wetter</h2><p>Aktuelle Bedingungen für deinen Ort</p></div><form id="air-weather-form" class="air-weather-form"><input id="air-weather-city" value="Stuttgart" placeholder="Stadt eingeben" aria-label="Stadt"><button type="submit">Wetter laden</button></form><div id="air-weather-result" class="air-weather-result"><div class="weather-hero"><div class="weather-kicker">WETTER · LIVE</div><p>Gib einen Ort ein, um aktuelle Wetterdaten zu laden.</p></div></div><small class="air-live-attribution">Live-Daten: Open-Meteo · kein API-Schlüssel nötig.</small></div>`;
  if(id==="football")return `<div class="air-football"><div class="app-heading"><h2>Fußball</h2><p>Live-Spielstände und aktuelle Ergebnisse</p></div><form id="air-football-form" class="air-weather-form"><select id="air-football-league" aria-label="Liga"><option value="PL">Premier League</option><option value="BL1" selected>Bundesliga</option><option value="PD">La Liga</option><option value="SA">Serie A</option><option value="CL">Champions League</option></select><button type="submit">Spiele laden</button></form><div id="air-football-results"><p class="muted">Lade aktuelle Spielstände, sobald du eine Liga auswählst.</p></div><small class="air-live-attribution">Spielpläne: football-data.org. Je nach Wettbewerb ist ein API-Schlüssel erforderlich.</small></div>`;
  if(id==="stocks")return `<div class="stocks-app">
  <header class="stocks-hero">
    <div class="stocks-brand-row"><span class="stocks-brand-icon" data-art="stocks"></span><div><div class="stocks-eyebrow">AIR OS · MARKETS</div><h1>Aktien</h1></div><span class="stocks-live-tag"><i></i> Marktdaten</span></div>
    <p>Die Börse im Überblick. Kurse, Indizes und Charts an einem Ort.</p>
    <form class="stocks-search" id="stocks-search-form"><span>⌕</span><input id="stocks-search-input" autocomplete="off" placeholder="Aktie oder Symbol suchen – z. B. SAP, Apple, NVIDIA" aria-label="Aktie oder Symbol suchen"><button type="submit">Anzeigen</button></form>
  </header>
  <section class="stocks-quick">
    <div class="stocks-quick-heading">Schnellzugriff <span>Aktien & Indizes</span></div>
    <div class="stocks-quick-row">
      <button type="button" data-stocks-symbol="INDEX:DEU40" data-stocks-name="DAX"><span class="stocks-mini-icon dax">DAX</span><span><strong>DAX</strong><small>Deutschland</small></span><b>↗</b></button>
      <button type="button" data-stocks-symbol="XETR:SAP" data-stocks-name="SAP"><span class="stocks-mini-icon sap">SAP</span><span><strong>SAP</strong><small>Software</small></span><b>↗</b></button>
      <button type="button" data-stocks-symbol="NASDAQ:AAPL" data-stocks-name="Apple"><span class="stocks-mini-icon apple">A</span><span><strong>Apple</strong><small>Technologie</small></span><b>↗</b></button>
      <button type="button" data-stocks-symbol="NASDAQ:NVDA" data-stocks-name="NVIDIA"><span class="stocks-mini-icon nvidia">N</span><span><strong>NVIDIA</strong><small>Chips & KI</small></span><b>↗</b></button>
    </div>
  </section>
  <section class="stocks-panel stocks-chart-panel">
    <div class="stocks-panel-head"><div><span class="stocks-section-kicker">KURSCHART</span><h2 id="stocks-chart-title">DAX · Deutschland</h2></div><span class="stocks-data-label">TradingView</span></div>
    <div id="stocks-chart-widget" class="stocks-chart-widget"><div class="stocks-widget-loading">Interaktiver Kurschart wird geladen …</div></div>
  </section>
  <section class="stocks-panel stocks-market-panel">
    <div class="stocks-panel-head"><div><span class="stocks-section-kicker">MARKTÜBERSICHT</span><h2>Was bewegt die Börsen?</h2></div><span class="stocks-data-label">Kurse & Entwicklung</span></div>
    <div id="stocks-market-widget" class="stocks-market-widget"><div class="stocks-widget-loading">Marktdaten werden geladen …</div></div>
  </section>
  <div class="stocks-disclaimer">Marktdaten und Charts von TradingView. Kurse können je nach Börse zeitverzögert sein. Nur zu Informationszwecken – keine Anlageberatung.</div>
</div>`;
  if(id==="calculator")return `<div class="calc-layout"><div class="app-heading" style="padding:0 0 15px"><h2>Rechner</h2><p>Ein einfacher Desktop-Rechner.</p></div><div class="calc-display" id="calc-display">0</div><div class="calc-keys">${["7","8","9","÷","4","5","6","×","1","2","3","−","C","0","=","+"].map(k=>`<button class="${["÷","×","−","+","="].includes(k)?"operator":""}" data-key="${k}">${k}</button>`).join("")}</div></div>`;
  if(id==="settings")return `<div class="settings-layout air-settings"><div class="app-heading" style="padding:0 0 12px"><h2>Einstellungen</h2><p>Dein Schreibtisch, dein Stil. Änderungen werden automatisch auf diesem Gerät gespeichert.</p></div><div class="air-settings-section"><h3>Hintergrundbild</h3><div class="air-wallpaper-choices"><button type="button" data-wallpaper="clouds" class="air-wallpaper-choice"><span class="air-wallpaper-preview wallpaper-clouds"></span><strong>Blaue Wolken</strong></button><button type="button" data-wallpaper="yosemite" class="air-wallpaper-choice"><span class="air-wallpaper-preview wallpaper-yosemite"></span><strong>Yosemite</strong></button><button type="button" data-wallpaper="coast" class="air-wallpaper-choice"><span class="air-wallpaper-preview wallpaper-coast"></span><strong>Küste</strong></button><button type="button" data-wallpaper="aurora" class="air-wallpaper-choice"><span class="air-wallpaper-preview wallpaper-aurora"></span><strong>Aurora</strong></button><button type="button" data-wallpaper="midnight" class="air-wallpaper-choice"><span class="air-wallpaper-preview wallpaper-midnight"></span><strong>Mitternacht</strong></button></div></div><div class="setting-row"><span><strong>Eigenes Bild</strong><br><small class="muted">PNG, JPG, WEBP oder GIF · max. 3 MB</small></span><label class="secondary-button air-file-picker">Bild auswählen<input id="air-custom-wallpaper" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden></label></div><div class="setting-row"><span><strong>Akzentfarbe</strong><br><small class="muted">Farbe für Schaltflächen</small></span><input id="accent-color" type="color" value="#8f9ff4"></div><div class="setting-row"><label for="air-desktop-theme"><strong>Desktop-Design</strong></label><select id="air-desktop-theme"><option value="modern">Air Modern</option><option value="classic">Classic</option></select></div><div class="setting-row"><label for="air-dock-theme"><strong>Dock-Design</strong></label><select id="air-dock-theme"><option value="classic">Air Classic</option><option value="modern">Air Modern</option></select></div><div class="setting-row"><span><strong>Dock-Größe</strong><br><small class="muted">Symbole skalieren</small></span><input id="air-dock-size" type="range" min="36" max="64" step="2" value="48"></div><div class="setting-row"><span><strong>Glaseffekte reduzieren</strong><br><small class="muted">Deckendere Oberfläche</small></span><input id="reduce-glass" type="checkbox"></div><div class="setting-row"><span><strong>Animationen reduzieren</strong><br><small class="muted">Weniger Bewegung in Fenstern und Dock</small></span><input id="air-reduce-motion" type="checkbox"></div><div class="setting-row"><span><strong>Uhrzeit</strong><br><small class="muted">24-Stunden-Anzeige</small></span><input id="air-clock-24" type="checkbox" checked></div><button class="secondary-button" id="reset-settings">Alle Einstellungen zurücksetzen</button><p class="air-settings-status" id="air-settings-status" role="status">Einstellungen werden lokal gespeichert.</p></div>`;
  if(id==="spotify")return `<p>Spotify wird als installierte Desktop-App geöffnet.</p>`;
  if(id==="downloads")return `<div class="app-heading"><h2>Downloads</h2><p>Zuletzt geladene Dateien.</p></div><table class="file-table"><thead><tr><th>Name</th><th>Art</th><th>Datum</th></tr></thead><tbody><tr><td>Air-OS-Design.zip</td><td>Archiv</td><td>Heute</td></tr><tr><td>Hintergrundbild.jpg</td><td>Bild</td><td>Gestern</td></tr></tbody></table><div class="app-notice">Demo-Dateien – keine echten Downloads.</div>`;
  if(id==="trash")return `<div class="app-heading"><h2>Papierkorb</h2><p>Der Papierkorb ist leer.</p></div><div class="empty-trash"><span class="desktop-art" data-art="trash"></span><p>Keine Objekte im Papierkorb.</p></div>`;
  return `<h2>About Air-OS</h2><p>A fresh desktop concept inspired by the clarity of classic Mac desktops and modern glass UI.</p><div class="app-grid"><button class="app-tile" data-app="finder"><span class="app-icon finder-icon">▰</span><strong>Finder</strong><small>Browse sample folders</small></button><button class="app-tile" data-app="notes"><span class="app-icon notes-icon">▤</span><strong>Notes</strong><small>Write an idea</small></button><button class="app-tile" data-app="weather"><span class="app-icon weather-icon">☀</span><strong>Weather</strong><small>Sample forecast</small></button><button class="app-tile" data-app="settings"><span class="app-icon settings-icon">⚙</span><strong>Settings</strong><small>Personalize</small></button></div>`;
}

function tsEscape(value){
 return String(value==null?"":value).replace(/[&<>"']/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]});
}
function tsPlain(value){
 const node=document.createElement("div");node.innerHTML=String(value||"");
 return (node.textContent||node.innerText||"").replace(/\s+/g," ").trim();
}
function tsDate(value){
 if(!value)return "Aktuell";
 const d=new Date(value);if(Number.isNaN(d.getTime()))return "Aktuell";
 return d.toLocaleDateString("de-DE",{day:"2-digit",month:"short"})+" · "+d.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
}
function tsImage(item){
 const variants=item&&item.teaserImage&&item.teaserImage.imageVariants;
 const src=variants&&(variants["16x9-640"]||variants["16x9-512"]||variants["16x9-384"]||variants["1x1-432"]);
 return src&&/^https:\/\//i.test(src)?src:"";
}
function tsItemsFrom(data){
 const pool=[].concat(Array.isArray(data&&data.news)?data.news:[],Array.isArray(data&&data.regional)?data.regional:[],Array.isArray(data&&data.items)?data.items:[]);
 const seen=new Set();
 return pool.filter(function(item){
   if(!item||!item.title||!item.details||item.type==="audio"||item.type==="video")return false;
   if(seen.has(item.title))return false;seen.add(item.title);return true;
 }).slice(0,30);
}
function tsNewsCard(item,index,featured){
 const image=tsImage(item);
 const title=tsEscape(tsPlain(item.title));
 const topline=tsEscape(tsPlain(item.topline||item.ressort||"Nachrichten"));
 const summary=tsEscape(tsPlain(item.firstSentence||item.summary||""));
 const date=tsEscape(tsDate(item.date));
 if(featured){
   return '<button class="ts-feature-card" data-news-index="'+index+'">'+(image?'<img class="ts-feature-image" src="'+tsEscape(image)+'" alt="" loading="lazy">':'<div class="ts-feature-image ts-image-placeholder"><span>ts</span></div>')+'<span class="ts-feature-copy"><span class="ts-kicker">'+topline+'</span><strong>'+title+'</strong>'+(summary?'<span class="ts-summary">'+summary+'</span>':'')+'<small>'+date+' · Weiterlesen&nbsp; ↗</small></span></button>';
 }
 return '<button class="ts-story-row" data-news-index="'+index+'">'+(image?'<img src="'+tsEscape(image)+'" alt="" loading="lazy">':'<span class="ts-row-placeholder">ts</span>')+'<span class="ts-row-copy"><small>'+topline+' · '+date+'</small><strong>'+title+'</strong>'+(summary?'<span>'+summary+'</span>':'')+'</span><span class="ts-row-arrow">›</span></button>';
}
function tsRenderList(win,items){
 const view=win.querySelector("#ts-view");if(!view)return;
 if(!items.length){view.innerHTML='<div class="ts-empty"><span class="ts-empty-mark">ts</span><h3>Keine Meldungen gefunden</h3><p>Versuche es später erneut oder wähle einen anderen Bereich.</p><button class="ts-button" data-ts-refresh>Erneut laden</button></div>';return}
 win._tsItems=items;
 view.innerHTML='<section class="ts-top-story"><div class="ts-section-label"><span></span> DAS WICHTIGSTE</div>'+tsNewsCard(items[0],0,true)+'</section><section class="ts-more-news"><div class="ts-list-heading"><h2>Weitere Nachrichten</h2><span>'+items.length+' Meldungen</span></div><div class="ts-story-list">'+items.slice(1).map(function(item,i){return tsNewsCard(item,i+1,false)}).join("")+'</div></section>';
}
function tsRenderArticle(win,item,data){
 const view=win.querySelector("#ts-view");if(!view)return;
 const article=data&&typeof data==="object"?data:item;
 const title=tsEscape(tsPlain(article.title||item.title));
 const date=tsEscape(tsDate(article.date||item.date));
 const section=tsEscape(tsPlain(article.topline||item.topline||"Nachrichten"));
 const img=tsImage(article)||tsImage(item);
 const blocks=Array.isArray(article.content)?article.content:[];
 let body=blocks.map(function(block){
   if(!block)return "";
   if(block.type==="headline"&&block.value)return '<h3>'+tsEscape(tsPlain(block.value))+'</h3>';
   if(block.type==="text"&&block.value){const p=tsPlain(block.value);return p?'<p>'+tsEscape(p)+'</p>':""}
   if(block.type==="image"&&block.gallery&&block.gallery.length){const g=block.gallery[0];const gi=g.imageVariants||{};const src=gi["16x9-640"]||gi["16x9-512"]||"";return src?'<figure><img src="'+tsEscape(src)+'" alt="'+tsEscape(g.alttext||g.title||"")+'"><figcaption>'+tsEscape(g.title||"")+'</figcaption></figure>':""}
   return "";
 }).filter(Boolean).slice(0,70).join("");
 const intro=tsEscape(tsPlain(item.firstSentence||item.summary||""));
 if(!body&&intro)body='<p>'+intro+'</p>';
 view.innerHTML='<button class="ts-back" data-ts-back>‹ Alle Nachrichten</button><article class="ts-article"><div class="ts-kicker">'+section+'</div><h1>'+title+'</h1><div class="ts-article-meta">tagesschau · '+date+'</div>'+(img?'<img class="ts-article-hero" src="'+tsEscape(img)+'" alt="">':'')+(intro?'<p class="ts-article-lead">'+intro+'</p>':"")+'<div class="ts-article-body">'+(body||'<p>Der Artikeltext konnte nicht geladen werden. Bitte versuche es erneut.</p>')+'</div><div class="ts-article-source">Quelle: ARD-aktuell / tagesschau.de</div></article>';
}
async function tsLoadNews(win,section){
 const view=win.querySelector("#ts-view");if(!view)return;
 const status=win.querySelector("#ts-status");
 const endpoints={homepage:"https://www.tagesschau.de/api2u/homepage/",inland:"https://www.tagesschau.de/api2u/news/?ressort=inland",ausland:"https://www.tagesschau.de/api2u/news/?ressort=ausland",wirtschaft:"https://www.tagesschau.de/api2u/news/?ressort=wirtschaft",wissen:"https://www.tagesschau.de/api2u/news/?ressort=wissen",sport:"https://www.tagesschau.de/api2u/news/?ressort=sport"};
 const key=endpoints[section]?section:"homepage";
 if(status)status.innerHTML='<span class="ts-pulse"></span> '+(key==="homepage"?"Aktuelle Meldungen":"Bereich: "+tsEscape(key.charAt(0).toUpperCase()+key.slice(1)))+' · wird aktualisiert';
 view.innerHTML='<div class="ts-loading"><span class="ts-spinner"></span><span>Nachrichten werden geladen …</span></div>';
 try{
  const response=await fetch(endpoints[key],{headers:{Accept:"application/json"},cache:"no-cache"});
  if(!response.ok)throw new Error("HTTP "+response.status);
  const data=await response.json();
  const items=tsItemsFrom(data);
  if(!items.length)throw new Error("Keine Meldungen im Feed");
  win._tsSection=key;tsRenderList(win,items);
  if(status)status.innerHTML='<span class="ts-pulse"></span> Zuletzt aktualisiert: '+tsEscape(new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}));
 }catch(error){
  view.innerHTML='<div class="ts-empty"><span class="ts-empty-mark">ts</span><h3>Nachrichten gerade nicht erreichbar</h3><p>Die Live-Meldungen von tagesschau.de konnten nicht geladen werden. Prüfe die Internetverbindung.</p><button class="ts-button" data-ts-refresh>Erneut versuchen</button></div>';
  if(status)status.textContent="Verbindung fehlgeschlagen";
 }
}
async function tsOpenArticle(win,index){
 const items=win._tsItems||[];const item=items[index];if(!item)return;
 const view=win.querySelector("#ts-view");
 tsRenderArticle(win,item,item);
 if(view){const h=view.querySelector(".ts-article h1");if(h)h.insertAdjacentHTML("beforebegin",'<div class="ts-loading ts-inline-loading"><span class="ts-spinner"></span><span>Artikel wird geladen …</span></div>');}
 try{
  const u=new URL(item.details);
  if(u.protocol!=="https:"||u.hostname!=="www.tagesschau.de"||!u.pathname.startsWith("/api2u/"))throw new Error("Untrusted article URL");
  const response=await fetch(u.href,{headers:{Accept:"application/json"},cache:"no-cache"});
  if(!response.ok)throw new Error("Article unavailable");
  const data=await response.json();
  tsRenderArticle(win,item,data);
 }catch(error){
  const loader=win.querySelector(".ts-inline-loading");if(loader)loader.remove();
 }
}


const stocksKnownSymbols={
 "dax":{symbol:"INDEX:DEU40",name:"DAX · Deutschland"},
 "deu40":{symbol:"INDEX:DEU40",name:"DAX · Deutschland"},
 "sap":{symbol:"XETR:SAP",name:"SAP SE"},
 "siemens":{symbol:"XETR:SIE",name:"Siemens"},
 "allianz":{symbol:"XETR:ALV",name:"Allianz"},
 "bmw":{symbol:"XETR:BMW",name:"BMW"},
 "mercedes":{symbol:"XETR:MBG",name:"Mercedes-Benz"},
 "apple":{symbol:"NASDAQ:AAPL",name:"Apple"},
 "aapl":{symbol:"NASDAQ:AAPL",name:"Apple"},
 "microsoft":{symbol:"NASDAQ:MSFT",name:"Microsoft"},
 "msft":{symbol:"NASDAQ:MSFT",name:"Microsoft"},
 "nvidia":{symbol:"NASDAQ:NVDA",name:"NVIDIA"},
 "nvda":{symbol:"NASDAQ:NVDA",name:"NVIDIA"},
 "amazon":{symbol:"NASDAQ:AMZN",name:"Amazon"},
 "amzn":{symbol:"NASDAQ:AMZN",name:"Amazon"},
 "tesla":{symbol:"NASDAQ:TSLA",name:"Tesla"},
 "tsla":{symbol:"NASDAQ:TSLA",name:"Tesla"},
 "alphabet":{symbol:"NASDAQ:GOOGL",name:"Alphabet"},
 "google":{symbol:"NASDAQ:GOOGL",name:"Alphabet"},
 "meta":{symbol:"NASDAQ:META",name:"Meta Platforms"},
 "meta platforms":{symbol:"NASDAQ:META",name:"Meta Platforms"},
 "s&p 500":{symbol:"FOREXCOM:SPXUSD",name:"S&P 500"},
 "nasdaq":{symbol:"NASDAQ:NDX",name:"NASDAQ 100"},
 "nasdaq 100":{symbol:"NASDAQ:NDX",name:"NASDAQ 100"}
};
function stocksResolveSymbol(value){
 const q=String(value||"").trim();
 if(!q)return null;
 const known=stocksKnownSymbols[q.toLowerCase()];
 if(known)return known;
 if(/^[A-Za-z0-9._-]+:[A-Za-z0-9._-]+$/.test(q))return {symbol:q.toUpperCase(),name:q.toUpperCase()};
 if(/^[A-Za-z0-9.^_-]{1,18}$/.test(q))return {symbol:"NASDAQ:"+q.toUpperCase(),name:q.toUpperCase()};
 return null;
}
function stocksInjectWidget(target,src,config){
 if(!target)return;
 target.replaceChildren();
 const shell=document.createElement("div");shell.className="tradingview-widget-container";
 const inner=document.createElement("div");inner.className="tradingview-widget-container__widget";
 shell.appendChild(inner);target.appendChild(shell);
 const script=document.createElement("script");
 script.type="text/javascript";script.async=true;script.src=src;script.textContent=JSON.stringify(config);
 shell.appendChild(script);
}
function stocksLoadChart(win,symbol,name){
 const title=win.querySelector("#stocks-chart-title");
 if(title)title.textContent=name||symbol;
 const target=win.querySelector("#stocks-chart-widget");
 if(!target)return;
 target.innerHTML='<div class="stocks-widget-loading"><span class="stocks-spinner"></span> Kurschart für '+String(name||symbol).replace(/[&<>"]/g,"")+' wird geladen …</div>';
 stocksInjectWidget(target,"https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js",{
   autosize:true,symbol:symbol,interval:"D",timezone:"Europe/Berlin",theme:"light",style:"1",locale:"de_DE",
   withdateranges:true,allow_symbol_change:true,details:true,hotlist:true,calendar:false,
   hide_side_toolbar:false,save_image:false,backgroundColor:"#ffffff",support_host:"https://www.tradingview.com"
 });
}
function stocksLoadOverview(win){
 const target=win.querySelector("#stocks-market-widget");if(!target)return;
 stocksInjectWidget(target,"https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js",{
   colorTheme:"light",dateRange:"12M",showChart:true,locale:"de_DE",isTransparent:false,
   showSymbolLogo:true,showFloatingTooltip:false,width:"100%",height:"430",
   plotLineColorGrowing:"#159b79",plotLineColorFalling:"#dc5365",
   belowLineFillColorGrowing:"rgba(21,155,121,0.10)",belowLineFillColorFalling:"rgba(220,83,101,0.10)",
   belowLineFillColorGrowingBottom:"rgba(21,155,121,0)",belowLineFillColorFallingBottom:"rgba(220,83,101,0)",
   gridLineColor:"rgba(220,230,242,0.45)",scaleFontColor:"#6b7d92",symbolActiveColor:"rgba(48,111,220,0.10)",
   tabs:[
    {title:"Indizes",symbols:[{s:"INDEX:DEU40",d:"DAX"},{s:"FOREXCOM:SPXUSD",d:"S&P 500"},{s:"NASDAQ:NDX",d:"NASDAQ 100"},{s:"INDEX:UKX",d:"FTSE 100"},{s:"INDEX:NKY",d:"Nikkei 225"}]},
    {title:"Deutschland",symbols:[{s:"XETR:SAP",d:"SAP"},{s:"XETR:SIE",d:"Siemens"},{s:"XETR:ALV",d:"Allianz"},{s:"XETR:BMW",d:"BMW"},{s:"XETR:MBG",d:"Mercedes-Benz"}]},
    {title:"Technologie",symbols:[{s:"NASDAQ:AAPL",d:"Apple"},{s:"NASDAQ:MSFT",d:"Microsoft"},{s:"NASDAQ:NVDA",d:"NVIDIA"},{s:"NASDAQ:AMZN",d:"Amazon"},{s:"NASDAQ:TSLA",d:"Tesla"}]}
   ]
 });
}
function initStocksApp(win){
 stocksLoadChart(win,"INDEX:DEU40","DAX · Deutschland");
 stocksLoadOverview(win);
}


function appWindowHostRect(){return windows.getBoundingClientRect()}
function setWindowToViewportRect(win,rect){
 const host=appWindowHostRect();
 win.style.left=Math.max(0,Math.min(Math.max(0,host.width-rect.width),rect.left-host.left))+"px";
 win.style.top=Math.max(0,Math.min(Math.max(0,host.height-win.offsetHeight),rect.top-host.top))+"px";
 if(rect.width)win.style.width=Math.min(rect.width,host.width)+"px";
 if(rect.height)win.style.height=Math.min(rect.height,host.height)+"px";
}
function normalizeAppWindow(win){
 const rect=win.getBoundingClientRect(),host=appWindowHostRect();
 win.style.left=Math.max(0,Math.min(Math.max(0,host.width-rect.width),rect.left-host.left))+"px";
 win.style.top=Math.max(0,Math.min(Math.max(0,host.height-rect.height),rect.top-host.top))+"px";
 win.style.width=Math.min(rect.width,host.width)+"px";
 win.style.height=Math.min(rect.height,host.height)+"px";
 win.classList.add("positioned");
 win._airOSPositioned=true;
}
function appDockRect(id){
 const button=document.querySelector(".dock-app[data-app='"+id+"']");
 if(button&&!button.hidden)return button.getBoundingClientRect();
 const dock=document.querySelector(".dock");
 if(dock)return dock.getBoundingClientRect();
 return {left:innerWidth/2,top:innerHeight-40,width:36,height:28};
}
function dockMotionValues(win,id){
 const rect=win.getBoundingClientRect(),dock=appDockRect(id);
 const targetX=dock.left+dock.width/2,targetY=dock.top+dock.height/2;
 return {
  dx:targetX-(rect.left+rect.width/2),
  dy:targetY-(rect.top+rect.height/2),
  scale:Math.max(.055,Math.min(.18,Math.min(dock.width/Math.max(rect.width,1),dock.height/Math.max(rect.height,1))))
 };
}
function clearDockMotion(win){
 const motion=win._airOSMotion;
 if(motion){win._airOSMotion=null;motion.onfinish=null;try{motion.cancel()}catch(e){}}
 win.classList.remove("dock-animating","is-opening","is-minimizing");
 win.style.removeProperty("--dock-dx");win.style.removeProperty("--dock-dy");win.style.removeProperty("--dock-scale");
 win.style.opacity="";
}
function animateAppWindowFromDock(win,id){
 // Show the app synchronously. WebKit/Electron can retain a filled Web Animation
 // above CSS transforms, leaving a newly launched app invisible or unclickable.
 clearDockMotion(win);
 win.style.display="flex";
 win.style.visibility="visible";
 win.style.opacity="1";
 win.style.transform="none";
 win.style.pointerEvents="auto";
 win.classList.remove("dock-animating","is-opening","is-minimizing");
 win.style.zIndex=++zIndex;
 requestAnimationFrame(()=>{
  if(!win.isConnected)return;
  win.style.display="flex";
  win.style.visibility="visible";
  win.style.opacity="1";
  win.style.transform="none";
  win.style.pointerEvents="auto";
  win.classList.remove("dock-animating","is-opening","is-minimizing");
 });
}
function animateAppWindowIntoDock(win,id,done){
 if(win.classList.contains("is-minimizing"))return;
 if(typeof win.animate!=="function"){win.style.display="none";win.classList.remove("dock-animating","is-opening","is-minimizing");if(done)done();return;}
 clearDockMotion(win);
 const v=dockMotionValues(win,id);
 win.classList.add("dock-animating","is-minimizing");
 const motion=win.animate([
  {transform:"translate(0px,0px) scale(1)",opacity:1,borderRadius:"13px",filter:"saturate(1)"},
  {transform:"translate("+v.dx+"px,"+v.dy+"px) scale("+v.scale+")",opacity:0,borderRadius:"24px",filter:"saturate(.72)"}
 ],{duration:410,easing:"cubic-bezier(.55,0,.9,.35)",fill:"both"});
 win._airOSMotion=motion;
 motion.onfinish=()=>{
  if(win._airOSMotion!==motion)return;
  win._airOSMotion=null;motion.onfinish=null;motion.cancel();
  win.style.display="none";
  win.classList.remove("dock-animating","is-opening","is-minimizing");
  win.style.opacity="";
  if(done)done();
 };
}
function clampAppWindow(win){
 if(!win.isConnected||win.style.display==="none"||win.classList.contains("maximized"))return;
 const host=appWindowHostRect(),w=win.offsetWidth,h=win.offsetHeight;
 win.style.left=Math.max(0,Math.min(Math.max(0,host.width-w),parseFloat(win.style.left)||0))+"px";
 win.style.top=Math.max(0,Math.min(Math.max(0,host.height-h),parseFloat(win.style.top)||0))+"px";
}

function openApp(id){
 if(id==='spotify'){
  if(!window.airOS?.launchSpotify){const error='Spotify-Desktop-Start ist nur in der Air-OS Desktop-App verfügbar.';toast(error);return {ok:false,error}}
  return window.airOS.launchSpotify().then(()=>{toast('Start an Spotify übergeben. Das Spotify-Fenster wird vom Betriebssystem verwaltet.');return {ok:true}}).catch(error=>{const message=error.message||'Spotify konnte nicht gestartet werden.';toast(message);return {ok:false,error:message}});
 }
 const registered=window.airAppRegistry?.get(id);
 if(registered?.origin==='store'){
  if(!window.airOS?.appStore?.launch){const error='Diese App kann nur in Air-OS geöffnet werden.';toast(error);return {ok:false,error}}
  return window.airOS.appStore.launch(id).then(()=>({ok:true})).catch(error=>{const message=error.message||'App konnte nicht geöffnet werden.';toast(message);return {ok:false,error:message}});
 }
 if(!appNames[id])return {ok:false,error:'Diese App ist nicht verfügbar.'};
 if(openApps.has(id)){const w=openApps.get(id);if(w.style.display==="none")animateAppWindowFromDock(w,id);else w.style.zIndex=++zIndex;lifecycle?.transition(id,'focused');$("#active-app").textContent=appNames[id];return {ok:true}}
 const win=document.createElement("section");win.className="app-window"+(id==="tagesschau"?" tagesschau-window":"")+(id==="stocks"?" stocks-window":"")+(id==="home"?" air-home-window":"");win.style.zIndex=++zIndex;
 let body;
 try { body = appBody(id); }
 catch (error) {
  console.error("Air-OS konnte die App nicht vorbereiten:", id, error);
  toast(appNames[id] + " konnte nicht geöffnet werden. Bitte Konsole prüfen.");
  return {ok:false,error:appNames[id]+" konnte nicht geöffnet werden."};
 }
 win.innerHTML=`<div class="window-titlebar"><div class="traffic"><button class="close" aria-label="Fenster schließen"></button><button class="minimize" aria-label="Minimieren"></button><button class="maximize" aria-label="Maximieren"></button></div><div class="window-title">${id==="finder"?"Dokumente":appNames[id]}</div></div><div class="window-content">${body}</div>`; paintAppIcons(win); const resizeHandle=document.createElement("div");resizeHandle.className="window-resize-handle";resizeHandle.setAttribute("role","separator");resizeHandle.setAttribute("aria-label","Fenstergröße ändern");win.appendChild(resizeHandle);
 windows.appendChild(win);if(id==="airwrite")window.airWriteApp?.init(win);if(id==="launchpad")window.airLaunchpad?.mount(win);if(id==="store")window.airAppStore?.mount(win);normalizeAppWindow(win);if(id==="home")mountAirHome(win);openApps.set(id,win);lifecycle?.transition(id,'focused');$(".dock-app[data-app='"+id+"']")?.classList.add("is-open");$("#active-app").textContent=appNames[id];animateAppWindowFromDock(win,id);
 win.addEventListener("pointerdown",()=>{win.style.zIndex=++zIndex;lifecycle?.transition(id,'focused');$("#active-app").textContent=appNames[id]});
 $(".close",win).onclick=()=>animateAppWindowIntoDock(win,id,()=>{win.remove();openApps.delete(id);lifecycle?.transition(id,'closed');$(".dock-app[data-app='"+id+"']")?.classList.remove("is-open");$("#active-app").textContent="Finder"});
 $(".minimize",win).onclick=()=>{animateAppWindowIntoDock(win,id);lifecycle?.transition(id,'minimized');toast(appNames[id]+" ins Dock minimiert")};
 $(".maximize",win).onclick=()=>{
  if(!win.classList.contains("maximized")){
    win._airOSRestoreBounds={left:win.style.left,top:win.style.top,width:win.style.width,height:win.style.height};
    win.classList.add("maximized");lifecycle?.transition(id,'maximized');win.style.left="0px";win.style.top="0px";
    win.style.width="100%";win.style.height="100%";win.style.resize="none";
  }else{
    win.classList.remove("maximized");lifecycle?.transition(id,'focused');win.style.removeProperty("transform");const b=win._airOSRestoreBounds||{};
    win.style.left=b.left||"0px";win.style.top=b.top||"0px";win.style.width=b.width||"min(870px, calc(100% - 24px))";
    win.style.height=b.height||"min(480px, calc(100% - 24px))";win.style.resize="";
    delete win._airOSRestoreBounds;clampAppWindow(win);
  }
 };
 const bar=$(".window-titlebar",win);let drag=null;
 bar.addEventListener("pointerdown",e=>{
  if(e.button!==0||e.target.closest(".traffic")||e.target.closest("button")||win.classList.contains("maximized"))return;
  clearDockMotion(win);
  const r=win.getBoundingClientRect();
  drag={pointerId:e.pointerId,x:e.clientX-r.left,y:e.clientY-r.top};
  win.style.zIndex=++zIndex;bar.setPointerCapture(e.pointerId);e.preventDefault();
 });
 bar.addEventListener("pointermove",e=>{
  if(!drag||e.pointerId!==drag.pointerId)return;
  const host=appWindowHostRect();
  const x=e.clientX-host.left-drag.x,y=e.clientY-host.top-drag.y;
  win.style.left=Math.max(0,Math.min(Math.max(0,host.width-win.offsetWidth),x))+"px";
  win.style.top=Math.max(0,Math.min(Math.max(0,host.height-win.offsetHeight),y))+"px";
 });
 const stopWindowDrag=e=>{if(drag&&(!e||e.pointerId===drag.pointerId))drag=null};
 bar.addEventListener("pointerup",stopWindowDrag);bar.addEventListener("pointercancel",stopWindowDrag);bar.addEventListener("lostpointercapture",stopWindowDrag);
 const resizeGrip=$(".window-resize-handle",win);let resizing=null;
 resizeGrip.addEventListener("pointerdown",e=>{
  if(e.button!==0||win.classList.contains("maximized"))return;
  e.preventDefault();e.stopPropagation();clearDockMotion(win);
  const host=appWindowHostRect();
  resizing={pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,startWidth:win.offsetWidth,startHeight:win.offsetHeight,hostWidth:host.width,hostHeight:host.height};
  win.style.zIndex=++zIndex;resizeGrip.setPointerCapture(e.pointerId);
 });
 resizeGrip.addEventListener("pointermove",e=>{
  if(!resizing||e.pointerId!==resizing.pointerId)return;
  const host=appWindowHostRect(),left=Math.max(0,parseFloat(win.style.left)||0),top=Math.max(0,parseFloat(win.style.top)||0);
  const maxWidth=Math.max(1,host.width-left),maxHeight=Math.max(1,host.height-top);
  const minWidth=Math.min(340,maxWidth),minHeight=Math.min(220,maxHeight);
  const width=Math.max(minWidth,Math.min(maxWidth,resizing.startWidth+e.clientX-resizing.startX));
  const height=Math.max(minHeight,Math.min(maxHeight,resizing.startHeight+e.clientY-resizing.startY));
  win.style.width=width+"px";win.style.height=height+"px";
 });
 const stopWindowResize=e=>{if(resizing&&(!e||e.pointerId===resizing.pointerId))resizing=null};
 resizeGrip.addEventListener("pointerup",stopWindowResize);resizeGrip.addEventListener("pointercancel",stopWindowResize);resizeGrip.addEventListener("lostpointercapture",stopWindowResize);
 win.addEventListener("pointerdown",()=>{if(win.style.display!=="none")win.style.zIndex=++zIndex});
 win.addEventListener("click",e=>{
   const stockSymbol=e.target.closest("[data-stocks-symbol]");
   if(stockSymbol){stocksLoadChart(win,stockSymbol.dataset.stocksSymbol,stockSymbol.dataset.stocksName);return}
   const newsSection=e.target.closest("[data-news-section]");
   if(newsSection){win.querySelectorAll("[data-news-section]").forEach(b=>b.classList.toggle("active",b===newsSection));tsLoadNews(win,newsSection.dataset.newsSection);return}
   if(e.target.closest("[data-ts-refresh]")){tsLoadNews(win,win._tsSection||"homepage");return}
   const newsStory=e.target.closest("[data-news-index]");
   if(newsStory){tsOpenArticle(win,Number(newsStory.dataset.newsIndex));return}
   if(e.target.closest("[data-ts-back]")){tsRenderList(win,win._tsItems||[]);return}
   const app=e.target.closest("[data-app]");if(app){openApp(app.dataset.app);return}
   const folder=e.target.closest("[data-folder]");if(folder){toast(folder.dataset.folder+" – Beispielordner");return}
   const url=e.target.closest("[data-url]");if(url){window.open(url.dataset.url,"_blank","noopener,noreferrer");return}
   const key=e.target.closest("[data-key]");if(key){calcInput(key.dataset.key,win);return}
 });
 $("#stocks-search-form",win)?.addEventListener("submit",e=>{
   e.preventDefault();
   const input=$("#stocks-search-input",win);const item=stocksResolveSymbol(input?.value);
   if(!item){toast("Bitte ein gültiges Börsensymbol eingeben (z. B. SAP, AAPL oder NASDAQ:NVDA).");return}
   stocksLoadChart(win,item.symbol,item.name);
 });
 $("#finder-search",win)?.addEventListener("input",e=>{const q=e.target.value.toLowerCase();Array.from($("tr[data-file]",win)).forEach(row=>row.style.display=row.dataset.file.toLowerCase().includes(q)?"":"none")});
 $("#music-play",win)?.addEventListener("click",()=>toast("Demo-Modus: Keine Audioquelle verbunden"));
 $("#browser-form",win)?.addEventListener("submit",e=>{e.preventDefault();let q=$("#browser-query",win).value.trim();if(!q)return;let url=/^https?:\/\//i.test(q)?q:/^[\w-]+\.[a-z]{2,}/i.test(q)?"https://"+q:"https://www.google.com/search?q="+encodeURIComponent(q);window.open(url,"_blank","noopener,noreferrer")});
 if(id==="notes")window.airNotes?.mount(win);
 if(id==='reminders')window.airReminders?.mount(win);
 if(id==="settings") initAirSettings(win);
 $("#music-play",win)?.addEventListener("click",()=>{const audio=$("#air-music-audio",win);if(audio&&audio.src){audio.paused?audio.play().catch(()=>toast("Audiodatei konnte nicht abgespielt werden.")):audio.pause()}else toast("Wähle zuerst eine Musikdatei aus.")});
 if(id==="tagesschau")tsLoadNews(win,"homepage");
 if(id==="stocks")initStocksApp(win);
 if(id==="aircard" && window.airCardLiteApp) window.airCardLiteApp.init(win);
 if((id==="translator"||id==="ai") && window.airExtraApps)window.airExtraApps.mount(id,win);
 return {ok:true};
}
let calcExpr="";
function calcEvaluate(expression){
 const normalized=String(expression).replace(/\s/g,"");
 const tokens=normalized.match(/(?:\d+\.?\d*|\.\d+)|[()+\-*/]/g)||[];
 if(tokens.join("")!==normalized||tokens.length===0)throw new Error("Invalid expression");
 let pos=0;
 function primary(){
   const token=tokens[pos++];
   if(token==="+"||token==="-"){const value=primary();return token==="-"?-value:value}
   if(token==="("){const value=sum();if(tokens[pos++]!==")")throw new Error("Missing closing parenthesis");return value}
   if(token===undefined||!/^((\d+\.?\d*)|(\.\d+))$/.test(token))throw new Error("Expected number");
   return Number(token);
 }
 function product(){
   let value=primary();
   while(tokens[pos]==="*"||tokens[pos]==="/"){
     const op=tokens[pos++],right=primary();
     value=op==="*"?value*right:value/right;
   }
   return value;
 }
 function sum(){
   let value=product();
   while(tokens[pos]==="+"||tokens[pos]==="-"){
     const op=tokens[pos++],right=product();
     value=op==="+"?value+right:value-right;
   }
   return value;
 }
 const result=sum();
 if(pos!==tokens.length||!Number.isFinite(result))throw new Error("Invalid result");
 return result;
}

// Appearance settings are now persisted in an authenticated host-side profile.
let airSettingsCache={};
let airSettingsWrites=Promise.resolve();
const AIR_SETTINGS_KEY="air-os-desktop-settings-v2"; // legacy single-profile key (not read for authenticated profiles)
// Original Air-OS vector artwork, MIT: static clouds, no remote image or animation.
const AIR_MODERN_CLOUDS=`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
<defs>
 <linearGradient id="sky" x2="0.15" y2="1"><stop stop-color="#124f86"/><stop offset=".6" stop-color="#3d82b2"/><stop offset="1" stop-color="#9bbcc7"/></linearGradient>
 <linearGradient id="cloud" x2=".2" y2="1"><stop stop-color="#fff5df"/><stop offset=".55" stop-color="#e0dbcc"/><stop offset="1" stop-color="#a9b6bb"/></linearGradient>
 <filter id="soft" x="-30%" y="-40%" width="160%" height="180%"><feGaussianBlur stdDeviation="24"/></filter>
</defs>
<rect width="1920" height="1080" fill="url(#sky)"/>
<g filter="url(#soft)" fill="url(#cloud)">
 <path opacity=".73" d="M860-100c-95 110-16 177 90 192 77 11 133 65 214 60 99-7 75-95 165-104 126-12 200 53 278 20L1610-100Z"/>
 <ellipse cx="1890" cy="695" rx="220" ry="230"/>
 <ellipse cx="1690" cy="940" rx="390" ry="270"/>
 <ellipse cx="1375" cy="1040" rx="350" ry="170"/>
 <ellipse cx="1010" cy="1095" rx="330" ry="175"/>
 <ellipse cx="355" cy="1140" rx="580" ry="265"/>
 <ellipse cx="-95" cy="860" rx="220" ry="270"/>
</g>
<g filter="url(#soft)" fill="#fff3dd" opacity=".52"><ellipse cx="1910" cy="560" rx="120" ry="110"/><ellipse cx="1620" cy="850" rx="150" ry="110"/><ellipse cx="220" cy="1070" rx="270" ry="90"/></g>
</svg>`;
const AIR_WALLPAPERS={
 clouds:'url("data:image/svg+xml,'+encodeURIComponent(AIR_MODERN_CLOUDS)+'")',
 yosemite:'linear-gradient(180deg,#8bb6dc33,#152c5033),url("https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2560&q=85")',
 coast:'url("https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2560&q=85")',
 aurora:'url("https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2560&q=85")',
 midnight:'linear-gradient(135deg,#11182e,#273f68 50%,#070b17)'
};
function readAirSettings(){return {...airSettingsCache}}
function persistAirSettings(patch){
 const next={...readAirSettings(),...patch};airSettingsCache=next;applyAirSettings(next);
 if(window.airOS?.preferences){
  airSettingsWrites=airSettingsWrites.then(()=>airSettingsLoad).then(()=>window.airOS.preferences.update(patch)).then(saved=>{airSettingsCache={...airSettingsCache,...saved};}).catch(error=>{console.error('Einstellungen konnten nicht gespeichert werden:',error);toast('Einstellung konnte nicht gespeichert werden.')});
 }else{
  try{localStorage.setItem(AIR_SETTINGS_KEY,JSON.stringify(next))}catch{toast('Einstellungen konnten nicht gespeichert werden.')}
 }
 return next;
}
// Confirm this Control Center setting before applying it; share the existing write queue.
function persistAirDockTheme(dockTheme){
 const save=airSettingsWrites.then(()=>airSettingsLoad).then(()=>{
  if(!window.airOS?.preferences)throw new Error('Darstellungseinstellungen sind hier nicht verfügbar.');
  return window.airOS.preferences.update({dockTheme});
 }).then(saved=>{
  airSettingsCache={...readAirSettings(),dockTheme:saved.dockTheme};
  applyAirSettings(airSettingsCache);
  return saved;
 });
 airSettingsWrites=save.catch(()=>{}); // A failed request must not block a later retry.
 return save;
}
// Desktop and dock are independent fields in the same authenticated store/queue.
function persistAirDesktopTheme(desktopTheme){
 const save=airSettingsWrites.then(()=>airSettingsLoad).then(()=>{
  if(!window.airOS?.preferences)throw new Error('Desktop-Design ist nur in der angemeldeten Desktop-App verfügbar.');
  return window.airOS.preferences.update({desktopTheme});
 }).then(saved=>{
  airSettingsCache={...readAirSettings(),desktopTheme:saved.desktopTheme};
  applyAirSettings(airSettingsCache);
  return saved;
 });
 airSettingsWrites=save.catch(()=>{});
 return save;
}
// Confirmed-only, serialized pin changes, bound to the authenticated Main session.
function persistAirDockPin(id,pinned){
 const owner=window.airOS?.currentUser?.().catch(()=>null);
 const save=airSettingsWrites.then(()=>airSettingsLoad).then(async()=>{
  const session=(await owner)?.preferenceSession;
  const check=async()=>{
   if(!session||(await window.airOS?.currentUser?.())?.preferenceSession!==session)throw Object.assign(new Error('Die Anmeldung hat sich geändert.'),{code:'AIR_PROFILE_CHANGED'});
  };
  await check();
  const latest=await window.airOS.preferences.get();
  const dockPins=airDockPinUpdate(window.airAppRegistry,latest.dockPins,id,pinned,airDockCanPin);
  await check();
  let saved;
  try{saved=await window.airOS.preferences.update({dockPins},session)}catch(error){await check();throw error}
  await check();
  airSettingsCache={...readAirSettings(),dockPins:saved.dockPins};applyAirSettings(airSettingsCache);
  return saved;
 });
 airSettingsWrites=save.catch(()=>{});
 return save;
}
const airSettingsLoad=window.airOS?.preferences?
 window.airOS.preferences.get().then(saved=>{airSettingsCache=saved;applyAirSettings(saved)}).catch(error=>{console.error('Einstellungen konnten nicht geladen werden:',error)}):
 Promise.resolve().then(()=>{try{airSettingsCache=JSON.parse(localStorage.getItem(AIR_SETTINGS_KEY)||'{}')}catch{};applyAirSettings(airSettingsCache)});
function applyAirSettings(settings=readAirSettings()){
 const root=document.documentElement,wallpaper=document.querySelector(".wallpaper"),dock=document.querySelector(".dock");
 root.style.setProperty("--air-modern-clouds",AIR_WALLPAPERS.clouds);
 root.dataset.desktopTheme=settings.desktopTheme==='modern'?'modern':'classic';
 document.querySelectorAll("#air-desktop-theme").forEach(select=>{select.value=root.dataset.desktopTheme});
 if(settings.accent)root.style.setProperty("--accent",settings.accent);else root.style.removeProperty("--accent");
 if(dock){
  dock.dataset.theme=settings.dockTheme==='modern'?'modern':'classic';
  dock.style.setProperty("--air-dock-icon-size",(Number(settings.dockSize)||48)+"px");
  dock.classList.toggle("air-reduced-glass",!!settings.reduceGlass);
 }
 root.classList.toggle("air-reduced-motion",!!settings.reduceMotion);
 document.querySelectorAll("#air-dock-theme").forEach(select=>{select.value=settings.dockTheme==='modern'?'modern':'classic'});
 document.dispatchEvent(new Event("air-settings-changed"));
 const clock=document.querySelector("#clock");
 if(clock){const now=new Date();clock.textContent=now.toLocaleDateString("de-DE",{weekday:"short",day:"numeric",month:"short"})+"  "+now.toLocaleTimeString("de-DE",settings.clock24===false?{hour:"numeric",minute:"2-digit",hour12:true}:{hour:"2-digit",minute:"2-digit",hour12:false});}
 if(wallpaper){
  if(settings.customWallpaper)wallpaper.style.backgroundImage='linear-gradient(#dceaff08 0%,transparent 38%,#1027471c 100%),url("'+settings.customWallpaper+'")';
  else wallpaper.style.backgroundImage=AIR_WALLPAPERS[settings.wallpaper||"clouds"]||AIR_WALLPAPERS.clouds;
 }
 document.querySelectorAll("[data-wallpaper]").forEach(button=>button.classList.toggle("selected",(settings.wallpaper||"clouds")===button.dataset.wallpaper&&!settings.customWallpaper));
}
function initAirSettings(win){
 const s=readAirSettings();
 const desktopTheme=win.querySelector("#air-desktop-theme");
 if(desktopTheme){desktopTheme.value=s.desktopTheme==='modern'?'modern':'classic';desktopTheme.disabled=!window.airOS?.preferences;}
 const theme=win.querySelector("#air-dock-theme");if(theme)theme.value=s.dockTheme==='modern'?'modern':'classic';
 const accent=win.querySelector("#accent-color"),dockSize=win.querySelector("#air-dock-size"),glass=win.querySelector("#reduce-glass"),motion=win.querySelector("#air-reduce-motion"),clock=win.querySelector("#air-clock-24"),status=win.querySelector("#air-settings-status");
 if(accent)accent.value=s.accent||"#75aeea";
 if(dockSize)dockSize.value=String(s.dockSize||48);
 if(glass)glass.checked=!!s.reduceGlass;
 if(motion)motion.checked=!!s.reduceMotion;
 if(clock)clock.checked=s.clock24!==false;
 const announce=message=>{if(status)status.textContent=message};
 desktopTheme?.addEventListener('change',async()=>{
  if(desktopTheme.disabled)return;
  const requested=desktopTheme.value;
  desktopTheme.value=readAirSettings().desktopTheme==='modern'?'modern':'classic';
  desktopTheme.disabled=true;announce('Desktop-Design wird gespeichert …');
  try{await persistAirDesktopTheme(requested);announce('Desktop-Design gespeichert.')}
  catch(error){announce('Desktop-Design konnte nicht gespeichert werden. '+(error.message||''))}
  finally{desktopTheme.value=readAirSettings().desktopTheme==='modern'?'modern':'classic';desktopTheme.disabled=false;}
 });
 win.querySelectorAll("[data-wallpaper]").forEach(button=>button.addEventListener("click",()=>{
  persistAirSettings({wallpaper:button.dataset.wallpaper,customWallpaper:""});
  announce("Hintergrund gespeichert.");toast("Hintergrund geändert");
 }));
 accent?.addEventListener("input",e=>{persistAirSettings({accent:e.target.value});announce("Akzentfarbe gespeichert.")});
 theme?.addEventListener("change",e=>{persistAirSettings({dockTheme:e.target.value});announce("Dock-Design ausgewählt.")});
 dockSize?.addEventListener("input",e=>{persistAirSettings({dockSize:Number(e.target.value)});announce("Dock-Größe gespeichert.")});
 glass?.addEventListener("change",e=>{persistAirSettings({reduceGlass:e.target.checked});announce("Darstellung gespeichert.")});
 motion?.addEventListener("change",e=>{persistAirSettings({reduceMotion:e.target.checked});announce("Animationseinstellung gespeichert.")});
 clock?.addEventListener("change",e=>{persistAirSettings({clock24:e.target.checked});announce("Uhrformat gespeichert.")});
 win.querySelector("#air-custom-wallpaper")?.addEventListener("change",e=>{
  const file=e.target.files&&e.target.files[0];if(!file)return;
  if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type)){announce("Bitte PNG, JPG, WEBP oder GIF auswählen.");return}
  if(file.size>5*1024*1024){announce("Das Bild darf höchstens 5 MB groß sein.");return}
  const reader=new FileReader();reader.onload=()=>{persistAirSettings({customWallpaper:reader.result,wallpaper:""});announce("Eigenes Hintergrundbild gespeichert.")};reader.onerror=()=>announce("Bild konnte nicht gelesen werden.");reader.readAsDataURL(file);
 });
 win.querySelector("#reset-settings")?.addEventListener("click",()=>{
  if(window.airOS?.preferences){
    airSettingsWrites=airSettingsWrites.then(()=>airSettingsLoad).then(()=>window.airOS.preferences.reset()).then(settings=>{airSettingsCache=settings;applyAirSettings(settings);initAirSettingsValuesReset(win);announce('Einstellungen zurückgesetzt.');toast('Darstellung zurückgesetzt')}).catch(()=>announce('Zurücksetzen fehlgeschlagen.'));
  }else{
    try{localStorage.removeItem(AIR_SETTINGS_KEY)}catch{}
    airSettingsCache={};applyAirSettings({});initAirSettingsValuesReset(win);announce('Einstellungen zurückgesetzt.');
  }
 });
 applyAirSettings(s);
}
function initAirSettingsValuesReset(win){
 const s=readAirSettings();
 const desktopTheme=win.querySelector("#air-desktop-theme");if(desktopTheme)desktopTheme.value=s.desktopTheme==='modern'?'modern':'classic';
 const theme=win.querySelector("#air-dock-theme");if(theme)theme.value=s.dockTheme==='modern'?'modern':'classic';
 const accent=win.querySelector("#accent-color"),dockSize=win.querySelector("#air-dock-size"),glass=win.querySelector("#reduce-glass"),motion=win.querySelector("#air-reduce-motion"),clock=win.querySelector("#air-clock-24");
 if(accent)accent.value=s.accent||"#75aeea";if(dockSize)dockSize.value="48";if(glass)glass.checked=false;if(motion)motion.checked=false;if(clock)clock.checked=true;
}
document.addEventListener("click",e=>{
 const external=e.target.closest("[data-url]");if(external){const url=external.dataset.url;if(/^https:\/\//i.test(url))window.open(url,"_blank","noopener,noreferrer")}
});
document.addEventListener("DOMContentLoaded",()=>applyAirSettings());

function calcInput(key,win){const display=$("#calc-display",win);if(!display)return;if(key==="C"){calcExpr="";display.textContent="0";return}if(key==="="){try{const safe=calcExpr.replace(/×/g,"*").replace(/÷/g,"/").replace(/−/g,"-");const result=calcEvaluate(safe);calcExpr=String(result);display.textContent=calcExpr}catch{display.textContent="Error";calcExpr=""}return}calcExpr+=key;display.textContent=calcExpr}
document.addEventListener("click",e=>{const app=e.target.closest("[data-app]");if(app)openApp(app.dataset.app)});
$("#welcome-open")?.addEventListener("click",()=>openApp("finder"));
$("#about-menu")?.addEventListener("click",()=>openApp("about"));
$("#view-menu")?.addEventListener("click",()=>toast("Fenster und Ansichten befinden sich in der Vorschau."));
$("#file-menu")?.addEventListener("click",()=>openApp("finder"));
$("#edit-menu")?.addEventListener("click",()=>toast("Bearbeiten – Demo-Menü"));
$("#go-menu")?.addEventListener("click",()=>openApp("downloads"));
$("#window-menu")?.addEventListener("click",()=>{const last=[...openApps.values()].at(-1); if(last){last.style.display="flex";last.style.zIndex=++zIndex;}});
$("#help-menu")?.addEventListener("click",()=>openApp("about"));

window.addEventListener("resize",()=>requestAnimationFrame(()=>openApps.forEach(win=>clampAppWindow(win))));

openApp("finder"); // Start with the reference layout
// Startup must not depend on the Dock animation completing. Some older WebKit/Electron
// builds can leave the first window in its opening transform and make the desktop look empty.
{
  const startupWindow = openApps.get("finder");
  if (startupWindow) {
    clearDockMotion(startupWindow);
    startupWindow.style.display = "flex";
    startupWindow.style.opacity = "1";
    startupWindow.style.transform = "none";
    startupWindow.classList.remove("dock-animating", "is-opening", "is-minimizing");
    startupWindow.style.zIndex = ++zIndex;
  }
}
paintAppIcons();
document.querySelectorAll(".dock-app").forEach(button => {
  const id = button.dataset.app;
  if (id && iconClasses[id]) button.classList.toggle("is-open", id === "finder");
});

if (window.airOS) {
  const profileMenu = document.querySelector("#account-menu-wrap");
  const toggle = document.querySelector("#account-toggle");
  const dropdown = document.querySelector("#account-dropdown");
  const signOut = document.querySelector("#sign-out-button");
  const closeProfileMenu = () => {
    if (dropdown) dropdown.hidden = true;
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  };
  window.airOS.currentUser().then(user => {
    if (!user) return;
    const displayName = user.displayName || user.username || "Benutzer";
    const username = user.username || "";
    const label = document.querySelector("#account-label");
    const fullName = document.querySelector("#account-fullname");
    const usernameEl = document.querySelector("#account-username");
    const avatar = document.querySelector("#account-avatar");
    if (label) label.textContent = displayName;
    if (fullName) fullName.textContent = displayName;
    if (usernameEl) usernameEl.textContent = "@" + username;
    if (avatar) avatar.textContent = displayName.trim().charAt(0).toLocaleUpperCase("de-DE") || "A";
    if (profileMenu) profileMenu.hidden = false;
  }).catch(() => {});
  toggle?.addEventListener("click", event => {
    event.stopPropagation();
    if (!dropdown) return;
    dropdown.hidden = !dropdown.hidden;
    toggle.setAttribute("aria-expanded", String(!dropdown.hidden));
  });
  document.addEventListener("click", event => {
    if (profileMenu && !profileMenu.contains(event.target)) closeProfileMenu();
  });
  signOut?.addEventListener("click", async () => {
    closeProfileMenu();
    document.dispatchEvent(new Event('air-profile-changing'));
    try { await window.airOS.logout(); } catch (error) { toast("Abmelden ist fehlgeschlagen."); }
  });
} else {
  const profileMenu = document.querySelector("#account-menu-wrap");
  if (profileMenu) profileMenu.hidden = true;
}

// Choose references from the existing Registry; never truncate or rewrite saved pins.
function airDockReferences(pins){return Array.isArray(pins)?pins.slice():['finder','browser','notes','music','settings']}
function airDockCanPin(id){
 const app=window.airAppRegistry.get(id);
 return id!=='launchpad'&&!!app?.iconClass&&!!(vectorIcon[id]||document.querySelector('.dock-icon.'+app.iconClass+' svg'));
}
function airDockPinUpdate(registry,pins,id,pinned,canPin){
 if(typeof id!=='string'||!registry.get(id)||id==='launchpad'||typeof pinned!=='boolean')throw new Error('Ungültige Dock-App.');
 if(pinned&&!canPin(id))throw new Error('Für diese App ist kein unterstütztes Dock-Icon verfügbar.');
 const next=airDockReferences(pins);
 if(!pinned)return next.filter(item=>item!==id);
 if(next.includes(id))return next;
 if(next.length>=64)throw new Error('Maximal 64 Dock-Pins möglich. Bitte zuerst eine App lösen.');
 return [...next,id];
}
function airDockSelection(registry,pins,width,iconSize){
 const candidates=[...new Set(['launchpad',...airDockReferences(pins)])].filter(id=>registry.get(id)?.iconClass);
 const icon=Math.max(30,Math.min(42,(Number(iconSize)||48)-6));
 const capacity=Math.max(1,Math.floor((Math.min(440,Math.max(0,width-24))-22)/(icon+14)));
 return {visible:candidates.slice(0,capacity),overflow:Math.max(0,candidates.length-capacity)};
}
function initAirDockLayout(){
 const dock=document.querySelector('.dock'),registry=window.airAppRegistry;
 const originals=Array.from(dock.children),buttons=new Map(originals.filter(el=>el.dataset.app).map(el=>[el.dataset.app,el]));
 const update=()=>{
  const settings=readAirSettings(),modern=settings.dockTheme==='modern',active=document.activeElement;
  const selection=airDockSelection(registry,settings.dockPins,window.innerWidth,settings.dockSize);
  if(modern){
   for(const id of selection.visible){
    if(!buttons.has(id)){
     const meta=registry.get(id),button=document.createElement('button'),icon=document.createElement('span');
     button.type='button';button.className='dock-app';button.dataset.app=id;button.dataset.extraPin='';button.title=meta.name;button.setAttribute('aria-label',meta.name);
     icon.className='dock-icon'+(meta.iconClass?' '+meta.iconClass:'');icon.textContent='';button.appendChild(icon);
     dock.appendChild(button);paintAppIcons(button);buttons.set(id,button);
    }
   }
   for(const [id,button]of buttons)button.hidden=!selection.visible.includes(id);
   for(const id of selection.visible)dock.appendChild(buttons.get(id));
   const start=buttons.get('launchpad');
   if(start){const label=selection.overflow?`Alle Apps · ${selection.overflow} weitere angeheftete Apps`:'Alle Apps · Launchpad';start.title=label;start.setAttribute('aria-label',label);}
  }else{
   for(const child of originals)dock.appendChild(child);
   for(const button of buttons.values())button.hidden=button.hasAttribute('data-extra-pin');
   const start=buttons.get('launchpad');if(start){start.title='Launchpad';start.setAttribute('aria-label','Launchpad');}
  }
  if(dock.contains(active)){
   if(active.hidden)buttons.get('launchpad')?.focus();
   else if(document.activeElement!==active)active.focus();
  }
  dock.scrollLeft=0;
 };
 document.addEventListener('air-settings-changed',update);
 window.addEventListener('resize',update);
 registry.onChange(update);
 update();
}
initAirDockLayout();

// One disclosure for Modern; reuse the original account controls and action handlers.
function initAirModernShell(){
 const shell=document.querySelector('#air-modern-shell'),toggle=document.querySelector('#air-system-toggle'),panel=document.querySelector('#air-system-panel');
 const profile=document.querySelector('#account-menu-wrap'),slot=document.querySelector('#air-modern-profile');
 const originalParent=profile.parentNode,originalNext=profile.nextSibling;
 const close=(restore=false)=>{
  panel.hidden=true;toggle.setAttribute('aria-expanded','false');
  document.querySelector('#account-dropdown').hidden=true;
  document.querySelector('#account-toggle').setAttribute('aria-expanded','false');
  if(restore)toggle.focus();
 };
 const sync=()=>{
  const modern=document.documentElement.dataset.desktopTheme==='modern';
  const active=document.activeElement;
  const needsFocus=modern?(document.querySelector('.menubar').contains(active)||document.querySelector('.desktop-icons').contains(active)):shell.contains(active);
  close();
  if(modern)slot.appendChild(profile);else originalParent.insertBefore(profile,originalNext);
  shell.hidden=!modern;
  if(needsFocus)(modern?toggle:document.querySelector('#air-search-open')).focus();
 };
 toggle.addEventListener('click',()=>{
  if(!panel.hidden){close();return}
  panel.hidden=false;toggle.setAttribute('aria-expanded','true');
  panel.querySelector('button:not([disabled])')?.focus();
 });
 panel.addEventListener('click',event=>{
  const action=event.target.closest('[data-app], [data-system-action]');
  if(!action)return;
  close(true);
  // App buttons use the existing document-level Registry/Lifecycle delegation.
  if(action.dataset.systemAction)document.getElementById(action.dataset.systemAction)?.click();
 });
 document.addEventListener('click',event=>{if(!shell.contains(event.target))close()});
 shell.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!panel.hidden){event.preventDefault();event.stopPropagation();close(true)}
 });
 shell.addEventListener('focusout',event=>{if(!shell.contains(event.relatedTarget))close()});
 document.addEventListener('air-settings-changed',sync);
 sync();
}
initAirModernShell();

// Robust launch handlers for Dock and desktop shortcuts. These controls must remain
// usable even if a window's own delegated click handler changes in a future build.
for (const launcher of document.querySelectorAll(".dock-app[data-app], .desktop-icon[data-app]")) {
  launcher.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    const id = launcher.dataset.app;
    if(id==='launchpad'&&window.airStartMenu?.enabled()){window.airStartMenu.toggle();return}
    if (id && window.airAppRegistry?.get(id)) openApp(id);
    else if (id) toast("Diese App ist noch nicht verfügbar.");
  }, true);
}

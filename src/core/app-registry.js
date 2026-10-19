'use strict';
// Internal UI metadata only; this registry does not install or authorize apps.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.airAppRegistry = api;
})(typeof window !== 'undefined' ? window : null, function () {
  const names = Object.assign(Object.create(null), {airwrite:"AirWrite",finder:"Finder",browser:"Safari",tagesschau:"tagesschau",mail:"Mail",calendar:"Kalender",photos:"Fotos",music:"Air Music",spotify:"Spotify",aircard:"AirCard Lite",notes:"Notizen",weather:"Wetter",football:"Fußball",stocks:"Aktien",calculator:"Air-Rechner",translator:"Air-Übersetzer",ai:"Air-KI",settings:"Einstellungen",downloads:"Downloads",trash:"Papierkorb",about:"Über Air-OS"});
  const iconClasses = Object.assign(Object.create(null), {airwrite:"airwrite-icon",finder:"finder-icon",browser:"browser-icon",tagesschau:"tagesschau-icon",mail:"mail-icon",calendar:"calendar-icon",photos:"photos-icon",music:"music-icon",spotify:"spotify-icon",aircard:"aircard-icon",notes:"notes-icon",weather:"weather-icon",football:"football-icon",stocks:"stocks-icon",calculator:"calc-icon",translator:"translator-icon",ai:"ai-icon",settings:"settings-icon",downloads:"downloads-icon",trash:"trash-icon"});
  const iconGlyphs = Object.assign(Object.create(null), {airwrite:"✎",finder:"◧",browser:"◎",tagesschau:"ts",mail:"✉",calendar:"31",photos:"✿",music:"♫",spotify:"●",aircard:"▤",notes:"≡",weather:"☀",football:"⚽",stocks:"⌁",calculator:"＋",settings:"⚙",downloads:"↓",trash:"▤"});
  const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  function get(id) {
    if (typeof id !== 'string' || !has(names, id)) return null;
    return Object.freeze({id, name:names[id], iconClass:has(iconClasses,id)?iconClasses[id]:'', glyph:has(iconGlyphs,id)?iconGlyphs[id]:''});
  }
  function list() { return Object.freeze(Object.keys(names).sort().map(get)); }
  function register(id, meta) {
    if (typeof id !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(id)) throw new TypeError('Ungültige App-ID.');
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) throw new TypeError('Ungültige App-Metadaten.');
    if (has(names,id)) throw new Error('App-ID bereits registriert.');
    if (typeof meta.name !== 'string' || !meta.name.trim() || meta.name.length > 80) throw new TypeError('Ungültiger App-Name.');
    const cls=meta.iconClass===undefined?'':meta.iconClass, glyph=meta.glyph===undefined?'':meta.glyph;
    if (typeof cls !== 'string' || (cls && !/^[a-z][a-z0-9-]{0,79}$/.test(cls))) throw new TypeError('Ungültige Icon-Klasse.');
    if (typeof glyph !== 'string' || glyph.length > 8) throw new TypeError('Ungültiges Icon-Zeichen.');
    names[id]=meta.name.trim();
    if (cls) iconClasses[id]=cls;
    if (glyph) iconGlyphs[id]=glyph;
    return get(id);
  }
  return Object.freeze({names,iconClasses,iconGlyphs,get,list,register});
});

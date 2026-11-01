'use strict';
const { contextBridge, ipcRenderer, webUtils } = require('electron');
contextBridge.exposeInMainWorld('airOS', Object.freeze({
  shelf:Object.freeze({
    list:owner=>ipcRenderer.invoke('air-os:nexus:shelf','list',null,owner),
    addText:(text,owner)=>ipcRenderer.invoke('air-os:nexus:shelf','text',text,owner),
    capture:owner=>ipcRenderer.invoke('air-os:nexus:shelf','capture',null,owner),
    consent:(enabled,owner)=>ipcRenderer.invoke('air-os:nexus:shelf','consent',enabled,owner),
    pick:owner=>ipcRenderer.invoke('air-os:nexus:shelf','pick',null,owner),
    drop:(files,owner)=>{if(!Array.isArray(files)||files.length<1||files.length>32)throw Error('Dateiauswahl ungültig.');const paths=files.map(file=>webUtils.getPathForFile(file));if(paths.some(p=>!p))throw Error('Nur tatsächlich ausgewählte Dateien.');return ipcRenderer.invoke('air-os:nexus:shelf','drop',paths,owner);},
    fromFinder:(relative,owner)=>ipcRenderer.invoke('air-os:nexus:shelf','workspace',relative,owner),
    group:(ids,name,owner)=>ipcRenderer.invoke('air-os:nexus:shelf','group',{ids,name},owner),
    children:(id,owner)=>ipcRenderer.invoke('air-os:nexus:shelf','children',id,owner),
    take:(bundle,id,owner)=>ipcRenderer.invoke('air-os:nexus:shelf','take',{bundle,id},owner),
    rename:(id,name,owner)=>ipcRenderer.invoke('air-os:nexus:shelf','rename',{id,name},owner),
    favorite:(id,value,owner)=>ipcRenderer.invoke('air-os:nexus:shelf','favorite',{id,value},owner),
    remove:(id,owner)=>ipcRenderer.invoke('air-os:nexus:shelf','remove',id,owner),
    copy:(id,owner)=>ipcRenderer.invoke('air-os:nexus:shelf','copy',id,owner),
    clear:owner=>ipcRenderer.invoke('air-os:nexus:shelf','clear',null,owner),
    drag:(id,owner)=>ipcRenderer.send('air-os:nexus:drag',id,owner),
    onChange:fn=>{if(typeof fn!=='function')throw Error('Listener erforderlich.');const handler=(_event,data)=>fn(data);ipcRenderer.on('air-os:nexus:shelf-changed',handler);return()=>ipcRenderer.removeListener('air-os:nexus:shelf-changed',handler);}
  }),
  timer:Object.freeze({
    read:owner=>ipcRenderer.invoke('air-os:nexus:timer','read',null,owner),
    start:(kind,seconds,owner)=>ipcRenderer.invoke('air-os:nexus:timer','start',{kind,seconds},owner),
    pause:owner=>ipcRenderer.invoke('air-os:nexus:timer','pause',null,owner),
    resume:owner=>ipcRenderer.invoke('air-os:nexus:timer','resume',null,owner),
    reset:owner=>ipcRenderer.invoke('air-os:nexus:timer','reset',null,owner),
    onChange:fn=>{if(typeof fn!=='function')throw Error('Listener erforderlich.');const handler=(_event,data)=>fn(data);ipcRenderer.on('air-os:nexus:timer-changed',handler);return()=>ipcRenderer.removeListener('air-os:nexus:timer-changed',handler);}
  }),
  accounts: () => ipcRenderer.invoke('air-os:accounts'),
  createAccount: data => ipcRenderer.invoke('air-os:create-account', data),
  login: data => ipcRenderer.invoke('air-os:login', data),
  currentUser: () => ipcRenderer.invoke('air-os:current-user'),
  lock: (preview,owner) => ipcRenderer.invoke('air-os:lock',preview,owner),
  lockPresentation: username => ipcRenderer.invoke('air-os:lock-presentation',username),
  logout: () => ipcRenderer.invoke('air-os:logout'),
  restart: () => ipcRenderer.invoke('air-os:restart-app'),
  quit: () => ipcRenderer.invoke('air-os:quit-app'),
  platform: process.platform,
  windowState: Object.freeze({toggle:owner=>ipcRenderer.invoke('air-os:window:fullscreen-toggle',owner),fullscreen:owner=>ipcRenderer.invoke('air-os:window:fullscreen-state',owner),onFullscreen:callback=>{if(typeof callback!=='function')throw Error('Listener required');const listener=(_event,value)=>callback(value);ipcRenderer.on('air-os:window:fullscreen',listener);return()=>ipcRenderer.removeListener('air-os:window:fullscreen',listener);}}),
  weather: Object.freeze({request:(action,data,owner)=>ipcRenderer.invoke('air-os:weather',action,data,owner)}),
  system: Object.freeze({
    snapshot: owner=>ipcRenderer.invoke('air-os:system:snapshot',owner),
    openSettings: (kind,owner)=>ipcRenderer.invoke('air-os:system:settings',kind,owner),
    copy: (text,owner)=>ipcRenderer.invoke('air-os:system:copy',text,owner),
    paste: owner=>ipcRenderer.invoke('air-os:system:paste',owner),
    hyprland: owner=>ipcRenderer.invoke('air-os:system:hyprland',owner),
    hyprlandWatch: (enabled,owner)=>ipcRenderer.invoke('air-os:system:hyprland-watch',enabled,owner),
    onHyprlandChange: callback=>{if(typeof callback!=='function')throw Error('Listener required');const listener=(_event,value)=>callback(value);ipcRenderer.on('air-os:hyprland:changed',listener);return()=>ipcRenderer.removeListener('air-os:hyprland:changed',listener);},
    onChange: callback=>{if(typeof callback!=='function')throw Error('Listener required');const listener=(_event,value)=>callback(value);ipcRenderer.on('air-os:system:changed',listener);return()=>ipcRenderer.removeListener('air-os:system:changed',listener);}
  }),
  control: Object.freeze({status:owner=>ipcRenderer.invoke('air-os:control:status',owner),setKeepAwake:(enabled,owner)=>ipcRenderer.invoke('air-os:control:awake',enabled,owner)}),
  glass: Object.freeze({testPolicy:()=>ipcRenderer.invoke('air-os:glass:test-policy')}),
  launchSpotify: () => ipcRenderer.invoke('air-os:spotify:launch'),
  appStore: Object.freeze({
    catalog: () => ipcRenderer.invoke('air-os:store:catalog'),
    installed: () => ipcRenderer.invoke('air-os:store:installed'),
    install: id => ipcRenderer.invoke('air-os:store:install',id),
    remove: id => ipcRenderer.invoke('air-os:store:remove',id),
    launch: id => ipcRenderer.invoke('air-os:store:launch',id)
  }),
  reminders: Object.freeze({
    list: () => ipcRenderer.invoke('air-os:reminders:list'),
    save: (item,owner) => ipcRenderer.invoke('air-os:reminders:save',item,owner),
    remove: id => ipcRenderer.invoke('air-os:reminders:remove',id)
  }),
  cloud: Object.freeze({
    status: () => ipcRenderer.invoke('air-os:cloud:status'),
    signIn: input => ipcRenderer.invoke('air-os:cloud:signIn',input),
    sync: () => ipcRenderer.invoke('air-os:cloud:sync'),
    signOut: () => ipcRenderer.invoke('air-os:cloud:signOut')
  }),
  notes: Object.freeze({
    list: () => ipcRenderer.invoke('air-os:notes:list'),
    save: note => ipcRenderer.invoke('air-os:notes:save',note),
    remove: (id,expectedSnapshot) => ipcRenderer.invoke('air-os:notes:remove',id,expectedSnapshot)
  }),
  preferences: Object.freeze({
    get: () => ipcRenderer.invoke('air-os:preferences:get'),
    update: (patch,expectedSession) => ipcRenderer.invoke('air-os:preferences:update',patch,expectedSession),
    reset: () => ipcRenderer.invoke('air-os:preferences:reset')
  }),
  files: Object.freeze({
    selectFolder: () => ipcRenderer.invoke('air-os:files:select-folder'),
    currentFolder: () => ipcRenderer.invoke('air-os:files:current-folder'),
    listDirectory: relativePath => ipcRenderer.invoke('air-os:files:list-directory', relativePath),
    searchNames: query => ipcRenderer.invoke('air-os:files:search',query),
    createFolder: relativePath => ipcRenderer.invoke('air-os:files:create-folder', relativePath),
    duplicateFile: (source,destination) => ipcRenderer.invoke('air-os:files:duplicate', source,destination),
    renameFile: (source,destination) => ipcRenderer.invoke('air-os:files:rename', source,destination),
    readTextFile: relativePath => ipcRenderer.invoke('air-os:files:read-text', relativePath),
    createTextFile: relativePath => ipcRenderer.invoke('air-os:files:create-text', relativePath),
    writeTextFile: (relativePath, content) => ipcRenderer.invoke('air-os:files:write-text', relativePath, content),
    openNative: relativePath => ipcRenderer.invoke('air-os:files:open-native', relativePath)
  }),
  airCardLite: Object.freeze({
    listDevices: () => ipcRenderer.invoke('aircard:list-devices'),
    scanCards: deviceID => ipcRenderer.invoke('aircard:scan-cards', deviceID),
    saveArtwork: (cardID, fileName, dataUrl) => ipcRenderer.invoke('aircard:save-artwork', cardID, fileName, dataUrl),
    getArtwork: cardID => ipcRenderer.invoke('aircard:get-artwork', cardID),
    applySkin: (deviceID, cardID) => ipcRenderer.invoke('aircard:apply-skin', deviceID, cardID)
  })
}));

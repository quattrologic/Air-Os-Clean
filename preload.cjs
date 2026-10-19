'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('airOS', Object.freeze({
  accounts: () => ipcRenderer.invoke('air-os:accounts'),
  createAccount: data => ipcRenderer.invoke('air-os:create-account', data),
  login: data => ipcRenderer.invoke('air-os:login', data),
  currentUser: () => ipcRenderer.invoke('air-os:current-user'),
  logout: () => ipcRenderer.invoke('air-os:logout'),
  restart: () => ipcRenderer.invoke('air-os:restart-app'),
  quit: () => ipcRenderer.invoke('air-os:quit-app'),
  platform: process.platform,
  appStore: Object.freeze({
    catalog: () => ipcRenderer.invoke('air-os:store:catalog'),
    installed: () => ipcRenderer.invoke('air-os:store:installed'),
    install: id => ipcRenderer.invoke('air-os:store:install',id),
    remove: id => ipcRenderer.invoke('air-os:store:remove',id),
    launch: id => ipcRenderer.invoke('air-os:store:launch',id)
  }),
  notes: Object.freeze({
    list: () => ipcRenderer.invoke('air-os:notes:list'),
    save: note => ipcRenderer.invoke('air-os:notes:save',note),
    remove: id => ipcRenderer.invoke('air-os:notes:remove',id)
  }),
  preferences: Object.freeze({
    get: () => ipcRenderer.invoke('air-os:preferences:get'),
    update: patch => ipcRenderer.invoke('air-os:preferences:update',patch),
    reset: () => ipcRenderer.invoke('air-os:preferences:reset')
  }),
  files: Object.freeze({
    selectFolder: () => ipcRenderer.invoke('air-os:files:select-folder'),
    currentFolder: () => ipcRenderer.invoke('air-os:files:current-folder'),
    listDirectory: relativePath => ipcRenderer.invoke('air-os:files:list-directory', relativePath),
    createFolder: relativePath => ipcRenderer.invoke('air-os:files:create-folder', relativePath),
    duplicateFile: (source,destination) => ipcRenderer.invoke('air-os:files:duplicate', source,destination),
    readTextFile: relativePath => ipcRenderer.invoke('air-os:files:read-text', relativePath),
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

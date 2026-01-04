const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    getAutoMode: () => ipcRenderer.invoke('get-auto-mode'),
    toggleAutoMode: (enabled) => ipcRenderer.invoke('toggle-auto-mode', enabled),
    syncInstructions: (instructions) => ipcRenderer.invoke('sync-instructions', instructions),
    isElectron: true
});

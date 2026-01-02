const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Add any specific API requirements here
    // For now, DevControl works mostly over HTTP to the backend
    platform: process.platform
});

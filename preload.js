const { contextBridge, ipcRenderer } = require('electron');
const { machineIdSync } = require('node-machine-id');

function getHwid() {
    try {
        return machineIdSync({ original: true });
    } catch (e) {
        return 'fallback-hwid-' + Date.now();
    }
}

const api = {
    sendNotification: (title, body) => ipcRenderer.send('show-notification', { title, body }),
    isElectron: true,
    getMachineId: getHwid
};

contextBridge.exposeInMainWorld('electron', api);
contextBridge.exposeInMainWorld('electronAPI', api);

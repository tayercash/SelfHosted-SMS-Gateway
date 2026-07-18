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
    getMachineId: getHwid,
    startCloudflare: () => ipcRenderer.send('run-start-script'),
    stopCloudflare: () => ipcRenderer.send('run-stop-script'),
    onServerStatus: (callback) => ipcRenderer.on('server-status', (event, data) => callback(data))
};

contextBridge.exposeInMainWorld('electron', api);
contextBridge.exposeInMainWorld('electronAPI', api);

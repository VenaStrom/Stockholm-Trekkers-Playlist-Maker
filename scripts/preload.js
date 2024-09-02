const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("downloadStatus", {
    get: () => ipcRenderer.invoke("get-download-status"),
})
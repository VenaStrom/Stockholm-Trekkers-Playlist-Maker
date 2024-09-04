const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("downloadStatus", {
    start: () => ipcRenderer.invoke("start-download"),
    get: () => ipcRenderer.invoke("get-download-status"),
})
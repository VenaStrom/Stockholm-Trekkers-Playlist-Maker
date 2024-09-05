const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("download", {
    start: () => ipcRenderer.invoke("start-download"),
    get: () => ipcRenderer.invoke("get-download-status"),
    filesExists: () => ipcRenderer.invoke("check-for-local-files"),
})
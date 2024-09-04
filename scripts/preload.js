const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("downloadStatus", {
    start: () => ipcRenderer.send("start-download"),
    get: () => ipcRenderer.invoke("get-download-status"),
})
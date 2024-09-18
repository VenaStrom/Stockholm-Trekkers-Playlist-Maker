const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("download", {
    start: () => ipcRenderer.invoke("start-download"),
    status: () => ipcRenderer.invoke("get-download-status"),
    filesExist: () => ipcRenderer.invoke("check-for-local-files"),
});

contextBridge.exposeInMainWorld("projects", {
    getAll: () => ipcRenderer.invoke("get-projects"),
});

contextBridge.exposeInMainWorld("userData", {
    get: (key) => ipcRenderer.invoke("get-user-data", key),
    set: (key, value) => ipcRenderer.invoke("set-user-data", key, value),
    remove: (key) => ipcRenderer.invoke("remove-user-data", key),
});
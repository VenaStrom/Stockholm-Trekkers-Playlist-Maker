const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("download", {
    start: () => ipcRenderer.invoke("start-download"),
    status: () => ipcRenderer.invoke("get-download-status"),
    filesExist: () => ipcRenderer.invoke("check-for-local-files"),
});

contextBridge.exposeInMainWorld("projects", {
    get: (id) => ipcRenderer.invoke("project-get", id),
    save: (projectJSON) => ipcRenderer.invoke("project-save", projectJSON),
    delete: (id) => ipcRenderer.invoke("project-delete", id),
    getAll: () => ipcRenderer.invoke("project-get-all"),
});

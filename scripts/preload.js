const { contextBridge, ipcRenderer, webUtils, dialog } = require("electron");

contextBridge.exposeInMainWorld("webUtils", webUtils);

contextBridge.exposeInMainWorld("dialog", {
    leavingWarning: (message) => ipcRenderer.invoke("confirm-leave", message),
});

contextBridge.exposeInMainWorld("appPath", {
    get: () => ipcRenderer.invoke("get-app-path"),
});

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

contextBridge.exposeInMainWorld("metadata", {
    get: (filePath) => ipcRenderer.invoke("get-metadata", filePath),
});

contextBridge.exposeInMainWorld("exporter", {
    start: (id) => ipcRenderer.invoke("start-export", id),
    getStatus: () => ipcRenderer.invoke("get-export-status"),
    cancel: () => ipcRenderer.invoke("cancel-export"),
});

contextBridge.exposeInMainWorld("importer", {
    import: () => ipcRenderer.invoke("import"),
});

contextBridge.exposeInMainWorld("explorer", {
    open: (path) => ipcRenderer.invoke("open-file-path", path),
});
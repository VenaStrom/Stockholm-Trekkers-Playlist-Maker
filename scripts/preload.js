"use strict";

const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("webUtils", webUtils);

contextBridge.exposeInMainWorld("main", {
    sendConsole: (type, message) => ipcRenderer.invoke("send-console", type, message),
});

contextBridge.exposeInMainWorld("dialog", {
    confirmLeaveUnsaved: (message) => ipcRenderer.invoke("confirm-leave-unsaved", message),
    confirmLeaveExporting: (message) => ipcRenderer.invoke("confirm-leave-exporting", message),
});

contextBridge.exposeInMainWorld("appPath", {
    get: () => ipcRenderer.invoke("get-app-root"),
});

contextBridge.exposeInMainWorld("assets", {
    download: () => ipcRenderer.invoke("start-download"),
    getStatus: () => ipcRenderer.invoke("get-download-status"),
    allExist: () => ipcRenderer.invoke("check-for-local-files"),
    getPath: () => ipcRenderer.invoke("get-assets-path"),
});

contextBridge.exposeInMainWorld("projects", {
    get: (id) => ipcRenderer.invoke("project-get", id),
    save: (projectJSON) => ipcRenderer.invoke("project-save", projectJSON),
    delete: (id) => ipcRenderer.invoke("project-delete", id),
    getAll: () => ipcRenderer.invoke("project-get-all"),
});

contextBridge.exposeInMainWorld("ffprobe", {
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
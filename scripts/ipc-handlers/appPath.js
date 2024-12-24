"use strict";
const path = require("node:path");
const { ipcMain } = require("electron");

const ipcHandlers = () => {
    // Expose the app path to the renderer
    ipcMain.handle("get-app-path", () => {
        return path.resolve(__dirname);
    });
};

module.exports = ipcHandlers;
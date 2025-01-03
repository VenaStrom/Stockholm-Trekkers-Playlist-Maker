"use strict";

const path = require("node:path");
const { ipcMain, app } = require("electron");

const ipcHandlers = () => {
    // Expose the app path to the renderer
    ipcMain.handle("get-app-root", () => {
        return app.getPath("userData");
    });
};

module.exports = { ipcHandlers } ;
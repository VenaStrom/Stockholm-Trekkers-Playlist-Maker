"use strict";
require("../extend/console.js"); // Adds more verbose logging to the console and colors!

const path = require("node:path");
const { ipcMain } = require("electron");

const ipcHandlers = () => {
    // Expose the app path to the renderer
    ipcMain.handle("get-app-path", () => {
        return path.resolve(__dirname);
    });
};

module.exports = { ipcHandlers } ;
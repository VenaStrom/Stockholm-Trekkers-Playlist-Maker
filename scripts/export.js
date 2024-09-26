const { ipcMain } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const raiseError = require("./raiseError.js");
const { projectGet, projectFolder } = require("./save/projects.js");

const projectExport = (id) => {
    const project = projectGet(id, projectFolder);
};

const setUpHandlers = () => {
    ipcMain.handle("start-export", (event, id) => {
        projectExport(id);
    });
};

module.exports = { setUpHandlers };
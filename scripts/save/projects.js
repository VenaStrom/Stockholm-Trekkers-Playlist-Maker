const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("node:path")
const raiseError = require("../raiseError.js");

const projectGet = (id) => {

};

const projectSave = (projectJSON) => {
    const id = projectJSON.id;
    if (!id) {
        raiseError("No ID provided for project save");
        return;
    }

};

const projectDelete = (id) => {

};

const setUpHandlers = () => {
    ipcMain.handle("project-get", projectSave);
    ipcMain.handle("project-save", projectSave);
    ipcMain.handle("project-delete", projectSave);
};

module.exports = { setUpHandlers };
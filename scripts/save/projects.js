const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("node:path")
const raiseError = require("../raiseError.js");

const projectGet = (id) => {

};

const projectSave = (projectJSON) => {
    const id = projectJSON.id;
    if (!id) {
        raiseError("No ID provided for the project save");
        return "No ID provided for the project save";
    };
};

const projectDelete = (id) => {

};

const projectGetAll = () => {

};

const setUpHandlers = () => {
    ipcMain.handle("project-get", projectGet);
    ipcMain.handle("project-save", projectSave);
    ipcMain.handle("project-delete", projectDelete);
    ipcMain.handle("project-get-all", projectGetAll);
};

module.exports = { setUpHandlers };
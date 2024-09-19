const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("node:path")
const raiseError = require("../raiseError.js");


const getMetaData = (filePath) => {
    
};

const setUpHandlers = () => {
    ipcMain.handle("get-meta-data", getMetaData);
};

module.exports = { setUpHandlers };
const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("node:path")
const raiseError = require("./raiseError.js");


const getMetaData = (filePath) => {
    const file = fs.statSync(filePath);
    console.log(file);
};

const setUpHandlers = () => {
    ipcMain.handle("get-meta-data", getMetaData);
};

module.exports = { setUpHandlers };

console.log("[DEBUG] getMetaData.js loaded");
getMetaData("assets/videos/pause_1_min_covid.mp4");
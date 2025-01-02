"use strict";

const path = require("node:path");
const fs = require("node:fs");

// This setup is required since _dirname only really works in the debugger but when building the path is different
const setup = (appPath) => {

    const userDataFolder = path.join(path.resolve(appPath), "user-data");
    if (!fs.existsSync(userDataFolder)) fs.mkdirSync(userDataFolder);
    
    const saveFilesFolder = path.join(userDataFolder, "save-files");
    if (!fs.existsSync(saveFilesFolder)) fs.mkdirSync(saveFilesFolder);
    
    const videoAssetsFolder = path.join(appPath, "assets", "videos");
    if (!fs.existsSync(videoAssetsFolder)) fs.mkdirSync(videoAssetsFolder);
    
    const downloadReferenceFile = path.join(appPath, "assetDownloadInfo.json");
    
    
    module.exports = { userDataFolder, saveFilesFolder, videoAssetsFolder, downloadReferenceFile };
};

module.exports = { setup };
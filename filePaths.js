"use strict";

const path = require("node:path");
const fs = require("node:fs");


const userDataFolder = path.join(path.resolve(__dirname), "user-data");
if (!fs.existsSync(userDataFolder)) fs.mkdirSync(userDataFolder);

const saveFilesFolder = path.join(userDataFolder, "save-files");
if (!fs.existsSync(saveFilesFolder)) fs.mkdirSync(saveFilesFolder);

const videoAssetsFolder = path.join(__dirname, "assets", "videos");
if (!fs.existsSync(videoAssetsFolder)) fs.mkdirSync(videoAssetsFolder);

const downloadReferenceFile = path.join(__dirname, "assetDownloadInfo.json");


module.exports = { userDataFolder, saveFilesFolder, videoAssetsFolder, downloadReferenceFile };
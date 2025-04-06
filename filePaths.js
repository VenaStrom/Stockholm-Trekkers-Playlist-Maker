const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const appName = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"))).name;

const externalDataFolder = path.join(os.homedir(), appName);
if (!fs.existsSync(externalDataFolder)) fs.mkdirSync(externalDataFolder, { recursive: true });

const userDataFolder = path.join(externalDataFolder, "user-data");
if (!fs.existsSync(userDataFolder)) fs.mkdirSync(userDataFolder, { recursive: true });

const saveFilesFolder = path.join(userDataFolder, "save-files");
if (!fs.existsSync(saveFilesFolder)) fs.mkdirSync(saveFilesFolder, { recursive: true });

const videoAssetsFolder = path.join(externalDataFolder, "assets");
if (!fs.existsSync(videoAssetsFolder)) fs.mkdirSync(videoAssetsFolder, { recursive: true });

const downloadReferenceFile = path.join(__dirname, "assetDownloadInfo.json");


module.exports = { userDataFolder, saveFilesFolder, videoAssetsFolder, downloadReferenceFile };
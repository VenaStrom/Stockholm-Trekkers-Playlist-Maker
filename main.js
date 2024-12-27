"use strict";
require("./scripts/extend/console.js"); // Adds more verbose logging to the console and colors!

const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const appCloseHandlers = require("./scripts/dialogs/handleAppClose.js");


// User Data Path //
const userDataFolder = path.join(path.resolve(__dirname), "user-data");
if (!fs.existsSync(userDataFolder)) fs.mkdirSync(userDataFolder);
const saveFilesFolder = path.join(userDataFolder, "save-files");
if (!fs.existsSync(saveFilesFolder)) fs.mkdirSync(saveFilesFolder);


const createMainWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            preload: path.join(__dirname, "scripts/preload.js"),
        },
        icon: path.join(__dirname, "assets/images/stockholm-trekkers-60.png"),
        frame: false,
        titleBarStyle: "hidden",
        titleBarOverlay: { color: "#1e1e1e", symbolColor: "#f2f2f2" },
    });

    // Handle when the app can close with and without a dialog
    mainWindow.isMain = true; // Allow things to find this window
    mainWindow.once("close", appCloseHandlers.onClose);
    mainWindow.once("closed", appCloseHandlers.onClosed);

    // Load and show the main window at the download assets page
    mainWindow.loadFile("./html/pages/download-page.html");
    mainWindow.maximize();
    mainWindow.focus();
};

app.once("ready", () => {
    createMainWindow();

    // Register IPC Handlers
    const ipcHandlers = [
        require("./scripts/ipc-handlers/importSaveFile.js").ipcHandlers,
        require("./scripts/ipc-handlers/projectGetters.js").ipcHandlers,
        require("./scripts/ipc-handlers/openFilePath.js").ipcHandlers,
        require("./scripts/ipc-handlers/appPath.js").ipcHandlers,
        require("./scripts/ipc-handlers/ffprobe.js").ipcHandlers,
        require("./scripts/download/downloadAssets.js").ipcHandlers,
        require("./scripts/dialogs/leaveDialog.js").ipcHandlers,
        require("./scripts/export/exportProject.js").ipcHandlers,
        require("./scripts/extend/console.js").ipcHandlers,
    ];
    ipcHandlers.forEach(handler => handler());
    console.info(`Registered ${ipcHandlers.length} IPC Handlers`);



    console.info({ _noTrace: true }, ""); // Trailing margin for prettiness reasons :)
});

module.exports = { userDataFolder, saveFilesFolder };
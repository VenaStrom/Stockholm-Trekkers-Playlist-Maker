"use strict";

const { app, BrowserWindow } = require("electron");
const path = require("node:path");
require("./scripts/extend/console.js"); // Adds more verbose logging to the console and colors!
const appCloseHandlers = require("./scripts/dialogs/handleAppClose.js");
const { ipcHandlers: ipcProjects } = require("./scripts/ipc-handlers/projectGetters.js");

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
    mainWindow.isMain = true; // Allow things to find main window
    mainWindow.once("close", appCloseHandlers.onClose);
    mainWindow.once("closed", appCloseHandlers.onClosed);

    // Load and show the main window at the download assets page
    mainWindow.loadFile("./html/pages/download.html");
    mainWindow.maximize();
    mainWindow.focus();
};

app.once("ready", () => {
    createMainWindow();

    // Register IPC Handlers
    const ipcHandlers = [
        require("./scripts/ipc-handlers/importSaveFile.js"),
        require("./scripts/ipc-handlers/openFilePath.js"),
        require("./scripts/ipc-handlers/appPath.js"),
        require("./scripts/ipc-handlers/ffprobe.js"),
        require("./scripts/download/downloadAssets.js"),
        require("./scripts/dialogs/leaveDialog.js"),
        require("./scripts/export/exportProject.js"),
        ipcProjects,
    ];
    ipcHandlers.forEach(handler => handler());
    console.info(`Registered ${ipcHandlers.length} IPC Handlers`);



    console.info({ _noTrace: true }, ""); // Trailing margin for prettiness reasons :)
});
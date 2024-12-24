"use strict";
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const handleAppClose = require("./scripts/dialogs/handleAppClose.js");
const { setUpHandlers: setUpFfprobeHandlers } = require("./scripts/ipc-handlers/ffprobe.js")
const { setUpHandlers: setUpSaveFileImportHandlers } = require("./scripts/ipc-handlers/importSaveFile.js")
const { setUpHandlers: setUpSaveFileFolderOpenerHandlers } = require("./scripts/ipc-handlers/openFilePath.js")
const { setUpHandlers: setUpProjectDataGetterHandlers } = require("./scripts/ipc-handlers/projectGetters.js")
const { setUpHandlers: setUpDownloadHandlers } = require("./scripts/download/downloadAssets.js");
const { setUpHandlers: setUpLeaveDialogHandlers } = require("./scripts/dialogs/leaveDialog.js");
const { setUpHandlers: setUpExportHandlers } = require("./scripts/export/exportProject.js");
const ipcAppPath = require("./scripts/ipc-handlers/appPath.js");
require("./scripts/extend/console.js"); // Adds more verbose logging to the console and colors!

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
    mainWindow.once("close", handleAppClose.onClose);
    mainWindow.once("closed", handleAppClose.onClosed);

    // Load and show the main window at the download assets page
    mainWindow.loadFile("./html/pages/download.html");
    mainWindow.maximize();
    mainWindow.focus();
};

app.once("ready", () => {
    createMainWindow();

    // Set up the handlers for the ipc messages
    // The handlers are defined in their respective files
    setUpFfprobeHandlers();
    setUpSaveFileImportHandlers();
    setUpSaveFileFolderOpenerHandlers();
    setUpProjectDataGetterHandlers();
    setUpDownloadHandlers();
    setUpLeaveDialogHandlers();
    setUpExportHandlers();
    ipcAppPath();


    console.info("handlers set up");
});

// Just in case something goes wrong, make the main window if it somehow didn't get made
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const { setUpHandlers: setUpDownloadHandlers } = require("./scripts/download/downloadAssets.js");
const { setUpHandlers: setUpProjectHandlers } = require("./scripts/save/projects.js");
const { setUpHandlers: setUpMetadataHandlers } = require("./scripts/getMetaData.js");
const { setUpHandlers: setUpExportHandlers } = require("./scripts/export.js");
const { setUpHandlers: setUpImportHandlers } = require("./scripts/import.js");
const { setUpHandlers: setUpOpenFileLocationHandlers } = require("./scripts/openFilePath.js");
const { setUpHandlers: setUpConfirmLeaveDialogHandler } = require("./scripts/confirmLeaveDialog.js");
const handleAppClose = require("./scripts/handleAppClose.js");

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

    // Set up the handlers for the main window //
    handleAppClose.onClose(mainWindow);
    handleAppClose.onClosed(mainWindow);

    // Load and show the main window at the download assets page
    mainWindow.loadFile("./html/pages/download.html");
    mainWindow.maximize();
    mainWindow.focus();
};

app.whenReady().then(() => {

    createMainWindow();

    // Set up the handlers for the ipc messages
    // The handlers are defined in their respective files
    setUpDownloadHandlers();
    setUpProjectHandlers();
    setUpMetadataHandlers();
    setUpExportHandlers();
    setUpImportHandlers();
    setUpOpenFileLocationHandlers();
    setUpConfirmLeaveDialogHandler();
    // Used by the download status to link to the app data
    ipcMain.handle("get-app-path", () => {
        return path.resolve(__dirname);
    });

    console.log("[INFO] handlers set up");

    // Just in case something goes wrong, make the main window if it somehow didn't get made
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

// Quit on macOS when all windows are closed due to how mac behaves with windows
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const appCloseHandlers = require("./scripts/dialogs/handleAppClose.js");
const { userDataFolder, saveFilesFolder, videoAssetsFolder, downloadReferenceFile } = require("./filePaths.js");

// MIGRATION PATCH //
// Migrate the old save files to the new save files folder
const oldSaveFilesFolder = path.join(path.resolve(__dirname), "projects");
if (fs.existsSync(oldSaveFilesFolder)) {
    const oldSaveFiles = fs.readdirSync(oldSaveFilesFolder);
    oldSaveFiles.forEach(file => {
        const oldSaveFilePath = path.join(oldSaveFilesFolder, file);
        const newSaveFilePath = path.join(saveFilesFolder, file);
        fs.copyFileSync(oldSaveFilePath, newSaveFilePath);
    });
    fs.rmdirSync(oldSaveFilesFolder, { recursive: true });
    console.info(`Migrated ${oldSaveFiles.length} save files to the new save files folder and removed the old save files folder`);
}


const createMainWindow = () => {
    /** @type {BrowserWindow & {isMain?:boolean}} */
    const mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            preload: path.join(__dirname, "scripts", "preload.js"),
        },
        icon: path.join(__dirname, "assets", "images", "stockholm-trekkers-60.png"),
        frame: false,
        titleBarStyle: "hidden",
        titleBarOverlay: { color: "#1e1e1e", symbolColor: "#f2f2f2" },
    });

    // Handle when the app can close with and without a dialog
    mainWindow.isMain = true; // Allow things to find this window
    mainWindow.on("close", appCloseHandlers.onClose);
    mainWindow.on("closed", appCloseHandlers.onClosed);

    // Load and show the main window at the download assets page
    mainWindow.loadFile("./html/pages/download-page.html");
    mainWindow.maximize();
    mainWindow.focus();

    // Anchor tags open in the default browser
    require("./scripts/extend/anchorRedirect.js").setup(mainWindow);
};

app.once("ready", () => {
    createMainWindow();

    // Register IPC Handlers
    const ipcHandlers = [
        require("./scripts/ipc-handlers/importSaveFile.js").ipcHandlers,
        require("./scripts/ipc-handlers/projectGetters.js").ipcHandlers,
        require("./scripts/ipc-handlers/openFilePath.js").ipcHandlers,
        require("./scripts/ipc-handlers/ffprobe.js").ipcHandlers,
        require("./scripts/download/downloadAssets.js").ipcHandlers,
        require("./scripts/export/exportProject.js").ipcHandlers,
        require("./scripts/ipc-handlers/fs.js").ipcHandlers,
    ];
    ipcHandlers.forEach(handler => handler());
    console.info(`Registered ${ipcHandlers.length} IPC Handlers`);
});

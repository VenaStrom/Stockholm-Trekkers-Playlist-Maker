
const { app, BrowserWindow } = require("electron");
if (require("electron-squirrel-startup")) app.quit();
const path = require("node:path");
const { setUpHandlers } = require("./scripts/downloadAssets");

const createWindow = () => {

    const mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            preload: path.join(__dirname, "scripts/preload.js")
        },
        icon: path.join(__dirname, "assets/images/stockholm-trekkers-60.png"),
        frame: false,
        titleBarStyle: "hidden",
        titleBarOverlay: { color: "#1e1e1e", symbolColor: "#f2f2f2" },
    });

    // mainWindow.openDevTools();

    mainWindow.on("closed", () => {
        BrowserWindow.getAllWindows().forEach(window => {
            window.close();
        });
    });

    mainWindow.maximize();
    mainWindow.loadFile("./html/index.html");
    mainWindow.focus();
};

app.whenReady().then(() => {
    createWindow();

    // downloadPauses();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});


const { app, BrowserWindow, nativeTheme } = require("electron");
const path = require("node:path");
const { setUpHandlers: setUpDownloadHandlers } = require("./scripts/download/downloadAssets.js");
const { setUpHandlers: setUpProjectHandlers } = require("./scripts/save/projects.js")

const createWindow = () => {

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

    // mainWindow.openDevTools();


    mainWindow.on("closed", () => {
        BrowserWindow.getAllWindows().forEach(window => {
            window.close();
        });
    });

    mainWindow.maximize();
    mainWindow.loadFile("./html/pages/download.html");
    mainWindow.focus();
};

app.whenReady().then(() => {
    
    createWindow();

    setUpDownloadHandlers();
    setUpProjectHandlers();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

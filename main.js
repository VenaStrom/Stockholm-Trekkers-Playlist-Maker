
const { app, BrowserWindow } = require('electron');
const path = require('node:path');

const createWindow = () => {

    const win = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        },
        icon: path.join(__dirname, "assets/stockholm-trekkers-60.png"),
        frame: false,
        titleBarStyle: "hidden",
    });

    win.maximize();
    win.loadFile("html/index.html");
};

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

const { BrowserWindow, session } = require("electron");
const fs = require("fs");

const downloadPauses = () => {
    console.log("downloading...");

    session.defaultSession.on("will-download", (event, item, webContents) => {
        item.setSavePath(path.join(__dirname, "assets/video/" + item.getFilename()));
    });

    const downloadTab = new BrowserWindow({
        // show: false
    });

    downloadTab.on("closed", () => {
        BrowserWindow.getAllWindows().forEach(window => {
            window.close();
        });
    });

    // downloadTab.webContents.downloadURL("https://drive.google.com/uc?export=download&id=1POheLkrK_1O786JByNvmHBnxbEijn82E")
    downloadTab.loadURL("https://drive.google.com/uc?export=download&id=1POheLkrK_1O786JByNvmHBnxbEijn82E")
    downloadTab.webContents.on("did-finish-load", () => {
        
    });
};


module.exports = { downloadPauses };
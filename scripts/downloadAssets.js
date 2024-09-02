const { BrowserWindow, session } = require("electron");
const fs = require("fs");
const path = require("node:path")

const downloadPauses = (force = false) => {

    if (!fs.existsSync("./assets/video")) {
        fs.mkdirSync("./assets/video", { recursive: true });
    }

    if (
        !force
        &&
        fs.existsSync("./assets/video/pause_2_h.mp4")
        &&
        fs.existsSync("./assets/video/pause_15_min_arsmote.mp4")
        &&
        fs.existsSync("./assets/video/pause_1_min_emergency.mp4")
        &&
        fs.existsSync("./assets/video/pause_1_min_covid.mp4")
        &&
        fs.existsSync("./assets/video/pause_1_min_countdown.mp4")
    ) {
        console.log("pauses already downloaded");
        return;
    }

    if (force) {
        console.log("force downloading...");
    } else {
        console.log("downloading...");
    }

    // Set download location
    session.defaultSession.on("will-download", (event, item, webContents) => {
        item.setSavePath(path.join(__dirname, "assets/video/" + item.getFilename()));
    });

    const downloadWindow = new BrowserWindow({
        // show: false
    });

    downloadWindow.on("closed", () => {
        BrowserWindow.getAllWindows().forEach(window => {
            window.close();
        });
    });

    const fileIDsJSON = fs.readFileSync("../assets/video/fileIDs.json")
    const fileIDs = JSON.parse(fileIDsJSON);

    const downloadPause = (id) => {
        console.log("downloading: " + id);

        downloadWindow.loadURL(fileIDs.urlFormat + id)
        downloadWindow.webContents.on("did-finish-load", () => {
            downloadWindow.webContents.executeJavaScript(`const inputElement = document.getElementById("download-form");`);
            downloadWindow.webContents.executeJavaScript(`inputElement.querySelector("uc-download-link").click();`);
            downloadWindow.webContents.executeJavaScript(`inputElement.click();`);
        });
    }

    fileIDs.videoIDs.forEach(id => {
        // console.log(id);
        downloadPause(id);
    });
};


module.exports = { downloadPauses };
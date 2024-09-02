const { BrowserWindow, session } = require("electron");
const fs = require("fs");
const path = require("node:path")

const downloadPauses = (force = false) => {

    if (!fs.existsSync("./assets/videos")) {
        fs.mkdirSync("./assets/videos", { recursive: true });
    }

    if (
        !force
        &&
        fs.existsSync("./assets/videos/pause_2_h.mp4")
        &&
        fs.existsSync("./assets/videos/pause_15_min_arsmote.mp4")
        &&
        fs.existsSync("./assets/videos/pause_1_min_emergency.mp4")
        &&
        fs.existsSync("./assets/videos/pause_1_min_covid.mp4")
        &&
        fs.existsSync("./assets/videos/pause_1_min_countdown.mp4")
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
        item.setSavePath(path.join(__dirname, "assets/videos/" + item.getFilename()));
    });

    const downloadWindow = new BrowserWindow({
        // show: false
    });

    downloadWindow.on("closed", () => {
        BrowserWindow.getAllWindows().forEach(window => {
            window.close();
        });
    });

    const fileIDsJSON = fs.readFileSync("../assets/videos/fileIDs.json")
    const fileIDs = JSON.parse(fileIDsJSON);

    const downloadPause = (id) => {
        console.log("downloading: " + id);

        downloadWindow.loadURL(fileIDs.urlFormat + id)
        downloadWindow.webContents.on("did-finish-load", () => {
            downloadWindow.webContents.executeJavaScript(`
                try {
                    const downloadButton = document.querySelector("uc-download-link");
                    inputElement.click();
                } catch (error) {
                console.log(error); 
                }`);
        });
    }

    fileIDs.videoIDs.forEach(id => {
        // console.log(id);
        downloadPause(id);
    });
};


module.exports = { downloadPauses };
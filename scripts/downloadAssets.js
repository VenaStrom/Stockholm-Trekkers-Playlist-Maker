const { BrowserWindow, session } = require("electron");
const fs = require("fs");
const path = require("node:path")

const downloadStatus = {
    "fileCount": 0,
    "atFile": 0,
    "status": "",
    "currentFile": {
        "size": 0,
        "received": 0,
        "percent": 0,
        "MB": 0
    }
}

const downloadPauses = (force = false) => {

    const videoFolder = path.join(__dirname, "../assets/videos/")

    if (force) {
        console.log("force downloading...");
        fs.rmSync(videoFolder, { recursive: true });
    } else {
        console.log("looking for files...");
    }

    if (!fs.existsSync(videoFolder)) {
        fs.mkdirSync(videoFolder, { recursive: true });
    }

    const fileIDs = JSON.parse(fs.readFileSync(path.join(__dirname, "fileIDs.json")))
    const videos = fileIDs.videos;
    downloadStatus.fileCount = videos.length;
    let index = 0;

    const endOfDownload = () => {
        if (index + 1 < videos.length) {
            index++;
            downloadStatus.atFile = index;
            getVideo(videos[index]);
        } else {
            downloadStatus.status = "completed";
            console.log("all videos downloaded");
        }
    };

    const getVideo = (fileID) => {
        if (fs.existsSync(videoFolder + fileID.name) && !force) {
            console.log(fileID.name + " already downloaded");
            endOfDownload();
            return;
        } else {
            console.log("downloading " + fileID.name);
        }

        const downloadWindow = new BrowserWindow({
            // show: false
        });

        session.defaultSession.on("will-download", (event, item, webContents) => {
            // item.setSavePath(videoFolder + item.getFilename());
            item.setSavePath(videoFolder + fileID.name);

            item.on("updated", (event, state) => {
                if (state === "interrupted") {
                    downloadStatus.status = "interrupted";
                    console.log("download is interrupted but can be resumed");
                } else if (state === "progressing") {
                    if (item.isPaused()) {
                        downloadStatus.status = "paused";
                        console.log(`download of ${fileID.name} is paused`);
                    } else {
                        const received = item.getReceivedBytes();
                        const total = item.getTotalBytes();
                        const percent = (received / total * 100).toFixed(0);
                        const MB = (received / 1024 / 1024).toFixed(0);
                        
                        downloadStatus.status = "progressing";
                        downloadStatus.currentFile.size = total;
                        downloadStatus.currentFile.received = received;
                        downloadStatus.currentFile.percent = percent;
                        downloadStatus.currentFile.MB = MB;

                        console.log(`${fileID.name} received ${percent}% ${MB} MB`);
                    };
                };
            });

            item.once("done", (event, state) => {
                if (state === "completed") {
                    console.log(`download of ${fileID.name} completed successfully`);
                } else {
                    console.log(`download failed with state: ${state}`);
                };

                endOfDownload();

                downloadWindow.close();
            });
        });

        downloadWindow.loadURL(fileIDs.urlTemplate + fileID.id);

        downloadWindow.webContents.on("did-finish-load", () => {
            downloadWindow.webContents.executeJavaScript(`try{document.getElementById("uc-download-link").click();} catch (error) {console.log(error);}`);
        });
    };

    getVideo(videos[index]);
};

module.exports = { downloadPauses };
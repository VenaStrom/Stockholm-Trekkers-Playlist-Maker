const { BrowserWindow, session } = require("electron");
const fs = require("fs");
const path = require("node:path")

const downloadStatus = {
    "fileCount": 0,
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
    let index = 0;

    const endOfDownload = () => {
        if (index + 1 < videos.length) {
            index++;
            getVideo(videos[index]);
        } else {
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
                    console.log("download is interrupted but can be resumed");
                } else if (state === "progressing") {
                    if (item.isPaused()) {
                        console.log(`download of ${fileID.name} is paused`);
                    } else {
                        console.log(`${fileID.name} received ${(item.getReceivedBytes() / item.getTotalBytes() * 100).toFixed(0)}% ${(item.getReceivedBytes() / 1024 / 1024).toFixed(0)} MB`);
                    };
                };
            });

            item.once("done", (event, state) => {
                if (state === "completed") {
                    console.log(`download of ${fileID.name} completed successfully`);
                } else {
                    console.log(`download failed with state: ${state}`);
                };

                if (index + 1 < videos.length) {
                    index++;
                    getVideo(videos[index]);
                } else {
                    console.log("all videos downloaded");
                };
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
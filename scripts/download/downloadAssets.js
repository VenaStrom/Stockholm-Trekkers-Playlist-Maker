const { BrowserWindow, ipcMain, app } = require("electron");
const fs = require("fs");
const path = require("node:path")
const raiseError = require("../raiseError.js");

const logStatus = {
    start: "[STARTED] ",
    end: "[FINISHED] ",
    info: "[INFO] ",
    error: "[ERROR] ",
    download: "[DOWNLOADING] ",
};

const downloadStatus = {
    "fileCount": 0,
    "atFile": 0,
    "status": "",
    "name": "",
    "size": 0,
    "received": 0,
    "percent": 0,
};

const downloadPauses = (force = false) => {
    const videoFolder = path.join(__dirname, "../../assets/videos/")

    downloadStatus.status = "starting";

    // If force downloading, delete the folder just to make sure
    if (force) {
        console.log(logStatus.info + "force downloading...");
        fs.rmSync(videoFolder, { recursive: true });
    } else {
        console.log(logStatus.info + "looking for files...");
    };

    // Check if the video folder exists and make it if it doesn't
    if (!fs.existsSync(videoFolder)) {
        fs.mkdirSync(videoFolder, { recursive: true });
    };

    const fileURLs = JSON.parse(fs.readFileSync(path.join(__dirname, "fileURLs.json")));
    const fileIDs = fileURLs.videos;
    let index = 0;

    downloadStatus.fileCount = fileIDs.length;
    downloadStatus.atFile = index;

    const browser = new BrowserWindow({
        show: false,
    });

    const getNextFile = () => {
        index++;

        if (index >= fileIDs.length) {
            console.log(logStatus.end + "all videos downloaded");
            downloadStatus.status = "completed";
            setTimeout(() => { browser.close(); }, 1000);

        } else {
            getFile(fileIDs[index]);
        }
    }

    const getFile = (file) => {
        if (!file) {
            console.error(logStatus.error + "no file");
            return;
        }

        // Check if video folder exists and make it if it doesn't
        if (!fs.existsSync(videoFolder)) {
            fs.mkdirSync(videoFolder, { recursive: true });
        };

        // If the video is already downloaded and we're not forcing, skip it
        if (fs.existsSync(videoFolder + file.name) && !force) {
            console.log(logStatus.info + file.name + " already downloaded");
            getNextFile();
            return;

        } else {
            console.log(logStatus.start + file.name);
        };

        downloadStatus.status = "downloading";
        downloadStatus.atFile = index;
        downloadStatus.name = file.name;

        // Sets where the downloaded file will end up and what to do when the download is under way and when it's done
        browser.webContents.session.once("will-download", (event, item, webContents) => {

            item.setSavePath(videoFolder + file.name);

            item.on("updated", (event, state) => {
                if (state === "interrupted") {
                    console.warn(logStatus.error + "download is interrupted but can be resumed");
                    raiseError("download is interrupted");
                    downloadStatus.status = "failed";

                    // Delete the file if it's interrupted
                    fs.rmSync(videoFolder + file.name);

                } else if (state === "progressing") {
                    if (item.isPaused()) {
                        console.warn(logStatus.error + `download of ${file.name} is paused`);
                        raiseError(`download of ${file.name} is paused`);
                        downloadStatus.status = "failed";

                        // Delete the file if it's paused
                        fs.rmSync(videoFolder + file.name);

                    } else {
                        const receivedMB = (item.getReceivedBytes() / 1024 / 1024).toFixed(2);
                        const fileSizeMB = (item.getTotalBytes() / 1024 / 1024).toFixed(0);
                        const percent = (item.getReceivedBytes() / item.getTotalBytes() * 100).toFixed(0);

                        downloadStatus.size = fileSizeMB;
                        downloadStatus.received = receivedMB;
                        downloadStatus.percent = percent;

                        console.log(logStatus.download + `${file.name} received ${receivedMB} / ${fileSizeMB} MB ${percent}%`);
                    };
                };
            });

            item.once("done", (event, state) => {
                if (state === "completed") {
                    console.log(logStatus.end + `download of ${file.name} completed successfully`);
                    getNextFile();

                } else {
                    console.error(logStatus.download + `download failed with state: ${state}`);
                    raiseError(`download failed with state: ${state}`);
                    downloadStatus.status = "failed";

                    // Delete the file if it fails
                    fs.rmSync(videoFolder + file.name);
                };
            });
        });

        setTimeout(() => {
            browser.loadURL(fileURLs.urlTemplate + file.id);
            browser.webContents.on("did-finish-load", () => {
                // Clicks the download button on the loaded page
                // This will break if Google changes how Drive works 
                // Theres a try-catch block in there but that's only gonna do so much
                browser.webContents.executeJavaScript(`try{document.getElementById("uc-download-link").click();} catch (error) {console.error(error); raiseError(error);}`);
            });
        }, 500);
    };

    getFile(fileIDs[index]);
};


const setUpHandlers = () => {
    ipcMain.handle("start-download", () => {
        downloadPauses();
        return;
    });

    ipcMain.handle("get-download-status", () => {
        return downloadStatus;
    });

    ipcMain.handle("check-for-local-files", () => {
        const fileURLs = JSON.parse(fs.readFileSync(path.join(__dirname, "fileURLs.json")));
        const fileIDs = fileURLs.videos;

        let fileCount = 0;

        fileIDs.forEach(file => {
            if (fs.existsSync(path.join(__dirname, "../../assets/videos", file.name))) {
                fileCount++;
            }
        });

        if (fileCount === fileIDs.length && fileCount === 0) {
            console.error(logStatus.error + "no files found");
            raiseError("no files found");
        }

        return (fileCount === fileIDs.length && fileCount > 0);
    });

    console.log(logStatus.info + "handlers set up");
};

module.exports = { setUpHandlers };
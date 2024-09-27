const { BrowserWindow, ipcMain } = require("electron");
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

// The object returned to the renderer process to show the download status
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

    // Get the URLs of the files that are gonna be downloaded, from fileURLs.json
    const fileURLs = JSON.parse(fs.readFileSync(path.join(__dirname, "fileURLs.json")));
    const fileIDs = fileURLs.videos;
    let index = 0;

    // Keep track of the download status
    downloadStatus.fileCount = fileIDs.length;
    downloadStatus.atFile = index;

    // Headless browser to download the files
    const browser = new BrowserWindow({
        show: false,
    });

    // Called at the end of each download or when a download is skipped
    const getNextFile = () => {
        index++;

        // When all the files are downloaded, close the browser
        if (index >= fileIDs.length) {
            console.log(logStatus.end + "all videos downloaded");
            downloadStatus.status = "completed";
            setTimeout(() => { browser.close(); }, 1000);

        } else {
            getFile(fileIDs[index]);
        }
    }

    // Gets a specific file with a given ID
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

            // Sets where the file will save to
            item.setSavePath(videoFolder + file.name);

            // On any update in the download it checks the state and does stuff accordingly
            item.on("updated", (event, state) => {
                if (state === "interrupted") {
                    console.warn(logStatus.error + "download is interrupted but can be resumed");
                    raiseError("download is interrupted");
                    downloadStatus.status = "failed";

                    // Delete the file if it's interrupted as to not leave a half-downloaded file
                    fs.rmSync(videoFolder + file.name);

                } else if (state === "progressing") {
                    if (item.isPaused()) {
                        console.warn(logStatus.error + `download of ${file.name} is paused`);
                        raiseError(`download of ${file.name} is paused`);
                        downloadStatus.status = "failed";

                        // Delete the file if it's paused
                        fs.rmSync(videoFolder + file.name);

                    } else {
                        // This happens when everything is going well
                        const receivedMB = (item.getReceivedBytes() / 1024 / 1024).toFixed(2);
                        const fileSizeMB = (item.getTotalBytes() / 1024 / 1024).toFixed(0);
                        const percent = (item.getReceivedBytes() / item.getTotalBytes() * 100).toFixed(0);

                        // Make sure the renderer knows what's going on
                        downloadStatus.size = fileSizeMB;
                        downloadStatus.received = receivedMB;
                        downloadStatus.percent = percent;

                        // Logging in the backend console for debugging mostly
                        console.log(logStatus.download + `${file.name} received ${receivedMB} / ${fileSizeMB} MB ${percent}%`);
                    };
                };
            });

            // This fires *once* when the download is done
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

        // Start the actual download in a kinda of janky way
        setTimeout(() => {
            browser.loadURL(fileURLs.urlTemplate + file.id);
            browser.webContents.on("did-finish-load", () => {
                // Clicks the download button on the loaded page
                // This will break if Google changes how Drive works 
                // Theres a try-catch block in there but that's only gonna do so much
                browser.webContents.executeJavaScript(`
                    try{
                        document.getElementById("uc-download-link").click();
                    } catch (error) {
                        console.error(error);
                        raiseError(error);
                    }`);
            });
        }, 500);
    };

    // Start the recursive download
    // The reason it's recursive is due to issues i had with having multiple download streams at once
    getFile(fileIDs[index]);
};


const setUpHandlers = () => {
    ipcMain.handle("start-download", () => {
        downloadPauses();
    });

    ipcMain.handle("get-download-status", () => {
        return downloadStatus;
    });

    // Gives a simple true or false if all the files are downloaded to check if you need to download at all
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
};

module.exports = { setUpHandlers };
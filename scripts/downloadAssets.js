const { BrowserWindow, session, ipcMain } = require("electron");
const fs = require("fs");
const path = require("node:path")
const raiseError = require("./raiseError.js");

const downloadStatus = {
    "fileCount": 0,
    "atFile": 0,
    "status": "",
    "currentFile": {
        "name": "",
        "size": 0,
        "received": 0,
        "percent": 0,
    },
};

const filesExist = () => {
    const fileIDs = JSON.parse(fs.readFileSync(path.join(__dirname, "fileIDs.json")));
    const videos = fileIDs.videos;

    let fileCount = 0;

    videos.forEach(video => {
        if (fs.existsSync(path + video.name)) {
            fileCount++;
        }
    });

    return fileCount === videos.length;
};

// const downloadPauses = (force = false) => {
//     const videoFolder = path.join(__dirname, "../assets/videos/")

//     // If force downloading, delete the folder just to make sure
//     if (force) {
//         console.log("force downloading...");
//         fs.rmSync(videoFolder, { recursive: true });
//     } else {
//         console.log("looking for files...");
//     };

//     // Check if the folder exists and make it if it doesn't
//     if (!fs.existsSync(videoFolder)) {
//         fs.mkdirSync(videoFolder, { recursive: true });
//     };

//     const downloadIDs = JSON.parse(fs.readFileSync(path.join(__dirname, "fileIDs.json")));
//     const videoIDs = downloadIDs.videos;
//     downloadStatus.fileCount = videoIDs.length;
//     downloadStatus.atFile = 1;
//     let index = 0;

//     const downloadWindows = {};

//     const endOfDownload = () => {
//         if (index + 1 < videoIDs.length) {
//             index++;
//             getVideo(videoIDs[index]);
//         } else {
//             downloadStatus.status = "completed";
//             console.log("all videos downloaded");

//             Object.keys(downloadWindows).forEach(key => {
//                 const window = downloadWindows[key];
//                 window.close();
//             });
//         };
//     };

//     const getVideo = (fileID) => {
//         downloadStatus.atFile++;

//         if (fs.existsSync(videoFolder + fileID.name) && !force) {
//             console.log(fileID.name + " already downloaded");
//             endOfDownload();
//             return;
//         } else {
//             console.log("downloading " + fileID.name);
//         };

//         downloadWindows[fileID.name] = new BrowserWindow({
//             show: false
//         });

//         session.defaultSession.on("will-download", (event, item, webContents) => {
//             item.setSavePath(videoFolder + fileID.name);

//             item.on("updated", (event, state) => {
//                 if (state === "interrupted") {
//                     downloadStatus.status = "interrupted";
//                     console.log("download is interrupted but can be resumed");
//                     raiseError("download is interrupted");

//                 } else if (state === "progressing") {
//                     if (item.isPaused()) {
//                         downloadStatus.status = "paused";
//                         console.log(`download of ${fileID.name} is paused`);
//                         raiseError(`download of ${fileID.name} is paused`);

//                     } else {
//                         const received = item.getReceivedBytes();
//                         const total = item.getTotalBytes();
//                         const percent = (received / total * 100).toFixed(0);
//                         const MB = (received / 1024 / 1024).toFixed(0);

//                         downloadStatus.status = "progressing";
//                         downloadStatus.currentFile.size = total;
//                         downloadStatus.currentFile.received = received;
//                         downloadStatus.currentFile.percent = percent;

//                         console.log(`${fileID.name} received ${percent}% ${MB} MB`);
//                     };
//                 };
//             });

//             item.once("done", (event, state) => {
//                 if (state === "completed") {
//                     console.log(`download of ${fileID.name} completed successfully`);
//                     downloadWindows[fileID.name].loadURL("about:blank");
//                     setTimeout(() => {
//                         endOfDownload();
//                     }, 100);
//                 } else {
//                     console.log(`download failed with state: ${state}`);
//                     raiseError(`download failed with state: ${state}`);
//                 };
//             });
//         });

//         downloadWindows[fileID.name].loadURL(downloadIDs.urlTemplate + fileID.id);

//         downloadWindows[fileID.name].webContents.on("did-finish-load", () => {
//             downloadWindows[fileID.name].webContents.executeJavaScript(`try{document.getElementById("uc-download-link").click();} catch (error) {console.log(error);}`);
//         });
//     };

//     getVideo(videoIDs[index]);
// };

const downloadPauses = (force = false) => {
    const videoFolder = path.join(__dirname, "../assets/videos/")

    // If force downloading, delete the folder just to make sure
    if (force) {
        console.log("force downloading...");
        fs.rmSync(videoFolder, { recursive: true });
    } else {
        console.log("looking for files...");
    };

    // Check if the video folder exists and make it if it doesn't
    if (!fs.existsSync(videoFolder)) {
        fs.mkdirSync(videoFolder, { recursive: true });
    };

    const downloadIDs = JSON.parse(fs.readFileSync(path.join(__dirname, "fileIDs.json")));
    const videoIDs = downloadIDs.videos;

    const browsers = {};

    const getOneVideo = (video) => {

        // If the video is already downloaded and we're not forcing, skip it
        if (fs.existsSync(videoFolder + video.name) && !force) {
            console.log(video.name + " already downloaded");
            return;
        } else {
            console.log("downloading " + video.name);
        };

        // Make a new browser window for each video to parallelize
        browsers[video.name] = new BrowserWindow({
            // show: false,
        });

        // Sets where the downloaded file will end up and what to do when the download is under way and when it's done
        browsers[video.name].webContents.session.on("will-download", (event, item, webContents) => {

            item.setSavePath(videoFolder + video.name);

            item.on("updated", (event, state) => {
                if (state === "interrupted") {
                    console.log("download is interrupted but can be resumed");
                    raiseError("download is interrupted");

                } else if (state === "progressing") {
                    if (item.isPaused()) {
                        console.log(`download of ${video.name} is paused`);
                        raiseError(`download of ${video.name} is paused`);

                    } else {
                        const received = item.getReceivedBytes();
                        const total = item.getTotalBytes();
                        const percent = (received / total * 100).toFixed(0);
                        const MB = (received / 1024 / 1024).toFixed(0);

                        console.log(`${video.name} received ${percent}% ${MB} MB`);
                    };
                };
            });

            item.once("done", (event, state) => {
                if (state === "completed") {
                    console.log(`download of ${video.name} completed successfully`);
                } else {
                    console.log(`download failed with state: ${state}`);
                    raiseError(`download failed with state: ${state}`);
                };
            });
        });

        browsers[video.name].loadURL(downloadIDs.urlTemplate + video.id);
        browsers[video.name].webContents.on("did-finish-load", () => {
            // Inject error raising script into loaded document TODO 
            // browsers[video.name].webContents.executeJavaScript("")

            // Clicks the download button on the loaded page
            // This will break if Google changes how Drive works 
            browsers[video.name].webContents.executeJavaScript(`try{document.getElementById("uc-download-link").click();} catch (error) {console.error(error); raiseError(error);}`);
        });
    };

    videoIDs.forEach(video => {
        getOneVideo(video);
    });
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
        return filesExist();
    });

    console.log("handlers set up");
};

module.exports = { setUpHandlers };
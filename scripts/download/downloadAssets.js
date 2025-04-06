const { BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("node:path");
const { userDataFolder, saveFilesFolder, videoAssetsFolder, downloadReferenceFile } = require("../../filePaths.js");

const status = {
    fileName: "",
    fileCount: 0,
    fileIndex: 0,
    fileSizeMB: "0.00",
    receivedMB: "0.00",
    progress: "0%",
    state: "starting",
}

const errorState = (browser) => {
    status.state = "failed";
    status.progress = "100%";

    browser.close();

    // Delete the files if it fails
    fs.rmSync(videoAssetsFolder, { recursive: true });
    fs.mkdirSync(videoAssetsFolder, { recursive: true });
};

const downloadFile = (url, destPath, fileName) => {
    return new Promise((resolve, reject) => {

        status.fileName = fileName;
        status.fileIndex++;
        status.fileSizeMB = "0.00";
        status.receivedMB = "0.00";
        status.progress = "0%";
        status.state = "downloading";

        console.info(`Starting download: ${fileName}`);

        // Create a headless window to download via
        const browser = new BrowserWindow({
            show: false,
        });

        // Set download dest path
        browser.webContents.session.once("will-download", (event, item, webContents) => {
            // Set where the file will save to
            item.setSavePath(destPath);
        });

        // Progress updates 
        browser.webContents.session.once("will-download", (event, item, webContents) => {
            item.on("updated", (event, state) => {

                // Fail state
                if (state === "interrupted") {
                    console.error(`Download of ${destPath} is interrupted`);
                    errorState(browser);

                    item.removeAllListeners("updated");

                    reject(`Download of ${destPath} is interrupted`);
                    return;
                }

                // Collect status data
                const receivedMB = (item.getReceivedBytes() / 1048576).toFixed(2);
                const fileSizeMB = (item.getTotalBytes() / 1048576).toFixed(2);
                const progress = (item.getReceivedBytes() / item.getTotalBytes() * 100).toFixed(0) + "%";

                status.fileSizeMB = fileSizeMB;
                status.receivedMB = receivedMB;
                status.progress = progress;

                console.info(`Downloading ${status.fileName}:\n${status.receivedMB} / ${status.fileSizeMB} MB (${status.progress}) - ${status.state}`);
            });
        });

        // When done
        browser.webContents.session.once("will-download", (event, item, webContents) => {
            item.once("done", (event, state) => {
                if (state === "completed") {
                    console.info(`Download of ${fileName} completed successfully`);

                    item.removeAllListeners("updated");

                    browser.close();

                    resolve({});

                    return;
                }
                else {
                    const errorMessage = `Download of ${fileName} failed with state: ${state}`;
                    console.error(errorMessage);
                    errorState(browser);
                    reject(errorMessage);
                }
            });
        });

        // INFO:
        // Downloading large files from Google Drive requires a confirmation since their anti-virus says it's too large.
        // Therefor, smaller downloads don't need the following block of code to start. They will just start as soon as the page loads.

        // Start download 
        browser.webContents.once("did-stop-loading", () => {
            browser.webContents.executeJavaScript(`
                try{
                    document.getElementById("uc-download-link").click();
                } catch (_) {}
            `.trim());
        });

        // Finally, go to url
        browser.webContents.loadURL(url, {}).catch((_) => { });
    });
};

const downloadAssets = () => {

    // Wipe the old files
    console.info("Removing old files...");
    fs.rmSync(videoAssetsFolder, { recursive: true });
    fs.mkdirSync(videoAssetsFolder, { recursive: true });

    // Look for what is going to be downloaded?
    if (!fs.existsSync(downloadReferenceFile)) {
        console.error(`Download reference file not found at ${downloadReferenceFile || "(missing path)"}`);
    }
    const assetDownloadInfo = JSON.parse(fs.readFileSync(downloadReferenceFile).toString());

    // File count
    status.fileCount = assetDownloadInfo.videos.length;

    // Compile the URLs
    const urlBase = assetDownloadInfo.urlTemplate;
    const assetData = assetDownloadInfo.videos.map((asset) => (
        { url: `${urlBase}${asset.id}`, destPath: path.join(videoAssetsFolder, asset.name), fileName: asset.name }
    ));


    // Download the files one at a time   
    assetData.reduce((promiseChain, currentTask) =>
        promiseChain.then(() => downloadFile(currentTask.url, currentTask.destPath, currentTask.fileName)), Promise.resolve())
        .then(() => {
            status.fileIndex = status.fileCount;
            status.state = "completed";
            status.progress = "100%";

            console.info("All downloads completed successfully");
        })
        .catch((error) => {
            console.error(`An error occurred during the download process: ${error}`);
        });
};

const ipcHandlers = () => {
    ipcMain.handle("start-download", () => {
        try {
            downloadAssets();
        } catch (error) {
            console.error(`An error occurred while starting the download: ${error}`);
        }
    });

    ipcMain.handle("get-download-status", () => {
        return status;
    });

    // Gives a simple true or false if all the files are downloaded to check if you need to download at all
    ipcMain.handle("check-for-local-files", () => {
        const assetDownloadInfo = JSON.parse(fs.readFileSync(downloadReferenceFile).toString());
        const fileNames = assetDownloadInfo.videos.map(file => file.name);

        // Look for the files in the video folder
        const assetsFolder = fs.readdirSync(videoAssetsFolder);
        const allFilesExist = fileNames.every(fileName => assetsFolder.includes(fileName));

        return allFilesExist;
    });

    ipcMain.handle("get-assets-path", () => {
        return videoAssetsFolder;
    });
};

module.exports = { ipcHandlers };
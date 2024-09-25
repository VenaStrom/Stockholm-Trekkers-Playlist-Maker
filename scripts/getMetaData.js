const { ipcMain } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const { execFile } = require("node:child_process");
const ffprobe = require("ffprobe-static").path;
const raiseError = require("./raiseError.js");


// Extract metadata using ffprobe
getVideoMetadata = (filePath) => {
    return new Promise((resolve, reject) => {
        execFile(ffprobe, [
            "-v", "error",
            "-show_format",
            "-show_streams",
            "-print_format", "json",
            filePath
        ], (error, stdout, stderr) => {
            if (error) {
                raiseError("Error running ffprobe", error);
                reject(`Error running ffprobe: ${stderr}`);
            } else {
                resolve(JSON.parse(stdout));
            }
        });
    });
}

const setUpHandlers = () => {
    // Handle when the renderer process requests metadata
    ipcMain.handle("get-metadata", async (event, filePath) => {
        try {
            return await getVideoMetadata(filePath);
        } catch (error) {
            raiseError("Error getting metadata", error);
            return undefined;
        }
    });
};

module.exports = { setUpHandlers };
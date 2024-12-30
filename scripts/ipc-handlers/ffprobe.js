"use strict";
require("../extend/console.js"); // Adds more verbose logging to the console and colors!

const { ipcMain } = require("electron");
const { execFile } = require("node:child_process");
const fs = require("node:fs");
const ffprobe = require("ffprobe-static").path;

// Extract metadata using ffprobe
const getVideoMetadata = (filePath) => {
    return new Promise((resolve, reject) => {
        execFile(ffprobe, [
            // "-v", "error",
            "-show_format",
            "-print_format", "json",
            filePath
        ], (error, stdout, stderr) => {
            if (error) {
                console.error("Error running ffprobe", stderr, error);
                reject(`Error running ffprobe: ${stderr}`);
            } else {
                resolve(JSON.parse(stdout));
            }
        });
    });
}

const getVideoDuration = async (filePath) => {
    const metadata = await getVideoMetadata(filePath);
    return metadata.format.duration;
};

const ipcHandlers = () => {
    // Handle when the renderer process requests metadata
    ipcMain.handle("get-metadata", async (event, filePath) => {
        if (!fs.existsSync(filePath)) {
            console.error(`File does not exist: ${filePath || "missing path"}`);
            return null;
        }

        return await getVideoMetadata(filePath);
    });

    // Handle when the renderer process requests the duration
    ipcMain.handle("get-duration", async (event, filePath) => {
        if (!fs.existsSync(filePath)) {
            console.error(`File does not exist: ${filePath || "missing path"}`);
            return null;
        }

        return await getVideoDuration(filePath);
    });
};

module.exports = { ipcHandlers };
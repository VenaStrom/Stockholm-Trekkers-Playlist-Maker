"use strict";

const { ipcMain } = require("electron");
const { execFile } = require("node:child_process");
const fs = require("node:fs");
const ffprobe = require("ffprobe-static").path;

// Extract metadata using ffprobe
const getVideoMetadata = (filePath) => {
    return new Promise((resolve, reject) => {
        execFile(ffprobe, [
            "-v", "error",
            "-show_format",
            "-show_streams",
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

const ipcHandlers = () => {
    // Handle when the renderer process requests metadata
    ipcMain.handle("get-metadata", async (event, filePath) => {
        if (!fs.existsSync(filePath)) {
            console.error(`File does not exist: ${filePath === "" ? "missing" : filePath}`);
            return undefined;
        }

        return await getVideoMetadata(filePath);
    });
};

module.exports = ipcHandlers;
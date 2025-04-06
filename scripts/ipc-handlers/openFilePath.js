const { ipcMain, dialog } = require("electron");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const openFilePath = (folderPath) => {
    const fullPath = path.resolve(folderPath); // Resolves the absolute path

    if (!fs.existsSync(fullPath)) { // Check if the path exists
        console.error(`Path does not exist: ${fullPath}`);
        dialog.showErrorBox("Error", `Path does not exist: ${fullPath}`);
        return;
    }

    if (process.platform === "win32") { // Windows
        spawn("explorer", [fullPath], { shell: true });

    } else if (process.platform === "linux") { // Linux
        spawn("xdg-open", [fullPath]);

    } else if (process.platform === "darwin") { // macOS which I don't build for but why not have it here
        spawn("open", [fullPath]);

    } else {
        console.error("Unsupported platform or error in openFilePath.js");
    }
};

const ipcHandlers = () => {
    ipcMain.handle("open-file-path", (event, folderPath) => {
        openFilePath(folderPath);
    });
};

module.exports = { ipcHandlers };
"use strict";
require("../extend/console.js"); // Adds more verbose logging to the console and colors!

const { ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const os = require("os");

const { saveFilesFolder } = require("../../main.js");

const showDialog = async () => {
    return dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
            { name: "JSON Files", extensions: ["json"] },
            { name: "All Files", extensions: ["*"] },
        ],
        buttonLabel: "Import",
        message: "Select a JSON file to import that save file",
        title: "Import Project",
        defaultPath: path.join(os.homedir()),

    }).then((dialogResult) => {
        if (dialogResult.canceled) return;

        const sourceFilePath = dialogResult.filePaths.at(0);
        const fileName = path.basename(sourceFilePath);
        const destFilePath = path.join(saveFilesFolder, fileName);

        // Ask to overwrite if the file already exists
        if (fs.existsSync(destFilePath)) {
            const result = dialog.showMessageBoxSync({
                type: "warning",
                title: "File Already Exists. Overwrite?",
                message: `A file named ${fileName} already exists in the projects folder. Do you want to overwrite it?`,
                buttons: ["Yes", "No"],
                defaultId: 1,
            })
            if (result === 0) {
                fs.rmSync(destFilePath);
            } else {
                return;
            }
        }
        fs.copyFileSync(sourceFilePath, destFilePath);
    });
};

const ipcHandlers = () => {
    ipcMain.handle("import", (event) => {
        return showDialog();
    });
};

module.exports = { ipcHandlers };
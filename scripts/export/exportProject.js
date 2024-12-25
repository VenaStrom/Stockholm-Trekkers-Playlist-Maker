"use strict";
require("../extend/console.js"); // Adds more verbose logging to the console and colors!

const { ipcMain, dialog } = require("electron");
const { Worker } = require("worker_threads");
const path = require("node:path");
const os = require("os");
const fs = require("node:fs");
const { projectGet } = require("../ipc-handlers/projectGetters.js");
const makePS1 = require("./createPS1.js");

// Assigned later in the projectExport function to a worker thread that copies all the assets
let copyWorker;

// The frontend fetches this to update the export window it shows
const exportStatus = {
    progress: "0%",
    message: "Making folders...",
    exportLocation: "",
};

// The main export function that is called when the user wants to export a project
const projectExport = (id) => {
    console.info(`Exporting project with id: ${id}`);

    // Update export status
    exportStatus.progress = "5%";
    exportStatus.message = "Making folders...";

    // Prompt with information about the export
    dialog.showMessageBoxSync({
        type: "info",
        buttons: ["OK"],
        title: "Good to know about exporting",
        message: `
CAUTION:
* Directly exporting to a USB drive can cause the program to hang. Always export to a system drive.
* Make sure you have enough space on your drive for the project. A project is usually around 20 GB.

Your export speed is very dependent on your disk speed, so you should export to a system drive to mitigate the risk of the program hanging and generally speed up the export.

After that, you can zip the file, upload it to the cloud, and also transfer it to a USB drive to bring to the Trekdag.
`});

    // Prompt to select the output folder
    const chosenFolder = dialog.showOpenDialogSync({
        properties: ["openDirectory"],
        buttonLabel: "Export here",
        title: "The project folder will end up here",
        message: "The project folder will end up here",
        defaultPath: path.join(os.homedir()),
    });

    // If the user cancels the export, return
    if (!chosenFolder) { return; };

    // Get JSON object of the project
    const projectData = projectGet(id);

    const exportLocation = path.join(chosenFolder.at(0), projectData.date);
    exportStatus.exportLocation = exportLocation;

    // Override existing folder confirmation
    if (fs.existsSync(exportLocation)) {
        if (
            dialog.showMessageBoxSync({
                type: "question",
                buttons: ["Yes", "No"],
                title: "Export",
                message: "The project folder already exists. Do you want to overwrite it? \n\n Clicking no will cancel the export.",
                defaultId: 1,
                cancelId: 1,
            })
        ) {
            return;
        }
        // If the user wants to overwrite the folder, delete the old folder
        fs.rmSync(exportLocation, { recursive: true });
    }

    // Make project folder
    fs.mkdirSync(exportLocation);

    // Make the ps1 script
    makePS1(projectData, exportLocation);

    // Makes a worker thread to copy all the assets and relay its status to the main thread
    copyWorker = new Worker(path.join(__dirname, "workerExport.js"));
    copyWorker.on("message", (message) => { // This updates the export status in the main scope
        if (message.type === "status") {
            exportStatus.message = message.message;
            exportStatus.progress = message.progress;
            console.info(`${parseFloat(message.progress).toFixed(2)}% - ${message.message}`);

        } else if (message.type === "error") {
            exportStatus.message = "ERROR: " + message.message + " Export cancelled.";
            exportStatus.progress = "100%";
            console.error(message.message);

            // Stop the worker thread that's copying all the assets
            copyWorker.terminate();
        }
    });

    // This starts the copying
    copyWorker.postMessage({ projectData, exportLocation, saveFilesFolder });
};


const ipcHandlers = () => {
    ipcMain.handle("start-export", (_, id) => {
        projectExport(id);
    });

    ipcMain.handle("get-export-status", (_) => {
        return exportStatus;
    });

    ipcMain.handle("cancel-export", (_) => {
        // Stop the worker thread that's copying all the assets
        copyWorker.terminate();

        // Remove the exported project folder
        fs.rmSync(exportStatus.exportLocation, { recursive: true });

        exportStatus.message = "Export cancelled";
    });
};

module.exports = { ipcHandlers };
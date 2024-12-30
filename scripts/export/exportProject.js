"use strict";
require("../extend/console.js"); // Adds more verbose logging to the console and colors!

const { ipcMain, dialog } = require("electron");
const { Worker } = require("node:worker_threads");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { projectGet } = require("../ipc-handlers/projectGetters.js");
const makePS1 = require("./createPS1.js");
const { userDataFolder, saveFilesFolder, videoAssetsFolder, downloadReferenceFile } = require("../../filePaths.js");

// Assigned later in the projectExport function to a worker thread that copies all the assets
let copyWorker;

// The frontend fetches this to update the export window it shows
const exportStatus = {
    progress: "0%",
    message: "Making folders...",
    status: "exporting",
    exportLocation: null,
};

const errorStatus = (message) => {
    exportStatus.message = message;
    exportStatus.status = "error";
    exportStatus.progress = "100%";
};

const cancelStatus = (message) => {
    exportStatus.message = message;
    exportStatus.status = "cancelled";
    exportStatus.progress = "100%";
};

// The main export function that is called when the user wants to export a project
const projectExport = (id) => {
    console.info(`Exporting project \n ID: ${id}`);

    // Update export status
    exportStatus.progress = "5%";
    exportStatus.message = "Making folders...";

    // Get JSON object of the project
    const projectData = projectGet(id);

    // Validate the project data
    if (!projectData) {
        console.error("Project not found");
        errorStatus("Project not found");
        return;
    }
    // No episodes
    if (
        !projectData.blocks
        ||
        projectData.blocks.length === 0
        ||
        !projectData.blocks.map(data => data.episodes).flat().length === 0
    ) {
        console.error("Project has no episodes");
        cancelStatus("Project has no episodes");
        return;
    }
    // No/missing paths
    const allEpisodes = projectData.blocks.map(data => data.episodes).flat();
    if (allEpisodes.some(episode => !fs.existsSync(episode.path))) {

        const suspectedPaths = allEpisodes
            .filter(episode => !fs.existsSync(episode.path))
            .map(episode => `<li>${episode.filePath}</li><li>${episode.filePath}</li><li>${episode.filePath}</li>`)
            .join("");

        console.error(`One or more files are missing or the file paths are wrong. Suspects: <ul class="missing-files">${suspectedPaths}</ul>`);
        errorStatus(`One or more files are missing or the file paths are wrong. Suspects: <ul class="missing-files">${suspectedPaths}</ul>`);
        return;
    }


    // Prompt to select the output folder
    const chosenFolder = dialog.showOpenDialogSync({
        properties: ["openDirectory"],
        buttonLabel: "Export here",
        title: "Choose export location",
        message: "Choose export location",
        defaultPath: path.join(os.homedir()), // OS agnostic home directory. Avoids opening System32 on Windows 
    });

    // If the user cancels the export
    if (!chosenFolder || chosenFolder.length === 0) {
        console.info("Export cancelled");
        cancelStatus("Export cancelled");
        return;
    };

    const exportLocation = path.join(chosenFolder[0], projectData.date);
    exportStatus.exportLocation = exportLocation;

    // Overwrite existing folder with confirmation
    if (fs.existsSync(exportLocation)) {
        const wantsToOverwrite = dialog.showMessageBoxSync({
            type: "question",
            buttons: ["Yes, overwrite", "No, cancel"],
            title: "Export",
            message: "A playlist already exists at this location. Do you want to overwrite it?",
            defaultId: 1,
            cancelId: 1,
        })

        if (wantsToOverwrite === 1) {
            console.info("Export cancelled");
            cancelStatus("Export cancelled");
            return;
        }

        // If the user wants to overwrite the folder, delete the old folder
        fs.rmSync(exportLocation, { recursive: true });
    }

    // Make folder at export location
    fs.mkdirSync(exportLocation);

    // Make the ps1 script
    makePS1(exportStatus, projectData, exportLocation);

    // Makes a worker thread to copy all the assets and relay its status to the main thread
    copyWorker = new Worker(path.join(__dirname, "copyWorker.js"));
    copyWorker.on("message", (message) => { // This updates the export status in the main scope
        // Status update
        if (message.type === "status") {
            console.info(`${parseFloat(message.progress).toFixed(2)}% - ${message.message}`);
            exportStatus.message = message.message;
            exportStatus.progress = message.progress;
            exportStatus.status = message.status;
            return;
        }
        // Error handling
        if (message.type === "error") {
            console.error(`Error on worker thread:\n${message.message}`);

            errorStatus(message.message);

            // Stop the worker thread that's copying all the assets
            copyWorker.terminate();

            // Remove the exported project folder
            if (fs.existsSync(exportLocation)) {
                fs.rmSync(exportLocation, { recursive: true });
            }
            return;
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
        copyWorker?.terminate();

        // Remove the exported project folder
        if (fs.existsSync(exportStatus.exportLocation)) {
            fs.rmSync(exportStatus.exportLocation, { recursive: true });
        }

        cancelStatus("Export cancelled");
    });
};

module.exports = { ipcHandlers };
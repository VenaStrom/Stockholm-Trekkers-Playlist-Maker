"use strict";
require("../extend/console.js"); // Adds more verbose logging to the console and colors!

const { parentPort } = require("worker_threads");
const fs = require("node:fs");
const path = require("node:path");

const exportStatus = {};

const copyAllAssets = (projectData, exportLocation, saveFilesFolder) => {
    // Copies the pause clips to the output folder
    const pauseFolder = path.join(__dirname, "..", "assets", "videos");

    // Update export status
    exportStatus.type = "status"; // This is added so the parent thread knows how to handle the post
    exportStatus.message = "Copying assets...";
    exportStatus.progress = "15%";
    parentPort.postMessage(exportStatus);

    // Copy the entire pauses folder to the output folder in /pauses
    console.info("Copying pauses...");
    fs.mkdirSync(path.join(exportLocation, "pauses"));
    fs.cpSync(pauseFolder, path.join(exportLocation, "pauses"), { recursive: true });

    // Make episodes folder
    fs.mkdirSync(path.join(exportLocation, "episodes"));

    // Update export status
    exportStatus.message = "Copying episodes...";
    exportStatus.progress = "20%";
    parentPort.postMessage(exportStatus);

    // Loop through all the episodes and copy them from their given path to the output folder
    console.info("Copying episodes...");
    projectData.blocks.forEach((block, blockIndex) => {
        block.episodes.forEach((episode, episodeIndex) => {

            // Update export status
            exportStatus.progress = `${20 + (80 / projectData.blocks.length / block.episodes.length) * (blockIndex * block.episodes.length + episodeIndex)}%`; // Gets a percent inbetween 20 and 100 based on which episode and block you are on
            parentPort.postMessage(exportStatus);

            // Check if the file path is missing or if the file is missing
            if (!episode.filePath || !fs.existsSync(episode.filePath)) {
                console.error(`Cannot find ${episode.fileName}. The file path (${episode.filePath}) might be incorrect or the file is missing.`);
                parentPort.postMessage({ type: "error", message: `Cannot find ${episode.fileName}. The file path (${episode.filePath ?? "empty string"}) might be incorrect or the file is missing.` });
                return;
            }

            // If a file with the same name already exists in the output folder, don't copy again
            if (fs.existsSync(path.join(exportLocation, "episodes", episode.fileName))) {
                console.warn(`A file (${episode.fileName || "empty string"}) wasn't copied due to the project already containing a file with the same name. This should be expected behavior when showing multiples of the same file but it could also be bad if files accidentally were named the same thing.`);
                return;
            };

            // Copy the episode to the output folder
            fs.copyFileSync(episode.filePath, path.join(exportLocation, "episodes", episode.fileName));
        });
    });

    // Copy the save file from user data to the output folder
    console.info("Copying save file...");
    fs.mkdirSync(path.join(exportLocation, "project-save-file"));
    fs.copyFileSync(path.join(saveFilesFolder, `${projectData.id}.json`), path.join(exportLocation, "project-save-file", `${projectData.id}.json`));

    // Update export status
    exportStatus.message = "Done!";
    exportStatus.progress = "100%";
    parentPort.postMessage(exportStatus);
};


parentPort.on("message", (message) => {
    console.info("Worker started working");
    copyAllAssets(message.projectData, message.exportLocation, message.saveFilesFolder);
});

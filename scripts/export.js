const { ipcMain, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const raiseError = require("./raiseError.js");
const { projectGet, projectFolder } = require("./save/projects.js");

const projectExport = (id) => {

    // Prompt with information about the export
    dialog.showMessageBoxSync({
        type: "info",
        buttons: ["OK"],
        title: "Good to know about exporting",
        message: "When exporting a project, your speed is limited only the the write speed of the disk you are exporting to. My suggestion is to export to your system drive for fast speeds. Then you should zip it and upload it to the cloud and copy it to a USB drive. This, in my experience, is the best and most convenient way of doing it since the program can hang if your writing directly to a USB drive.",
    });

    // Prompt to select the output folder
    const outputFolder = dialog.showOpenDialogSync({
        properties: ["openDirectory"],
        buttonLabel: "Export here",
        title: "Select where the project folder will be exported",
        message: "Select where the project folder will be exported",
    });

    // If the user cancels the export, return
    if (!outputFolder) { return; };

    // The project data json file
    const project = projectGet(id, projectFolder);

    // Sets the output path to the selected folder and the name of the project as a subfolder
    const outputPath = path.join(outputFolder[0], project.name);

    // Creates the project folder in the selected folder.
    // Confirm with the user to overwrite old folder, if not, cancel the export
    if (fs.existsSync(outputPath)) {
        if (
            !dialog.showMessageBoxSync({
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
        fs.rmSync(outputPath, { recursive: true });
    }

    // Create the output folder
    fs.mkdirSync(outputPath);

    // Copies the pause clips to the output folder
    const pauseFolder = path.join(__dirname, "..", "assets", "videos");

    // Copy the entire pauses folder to the output folder in /pauses
    fs.mkdirSync(path.join(outputPath, "pauses"));
    fs.cpSync(pauseFolder, path.join(outputPath, "pauses"), { recursive: true });

    // Make episodes folder
    fs.mkdirSync(path.join(outputPath, "episodes"));

    // Loop through all the episodes and copy them from their given path to the output folder
    project.blocks.forEach((block) => {
        block.episodes.forEach((episode) => {

            // Check if the file path is missing or if the file is missing
            if (episode.filePath === "") { raiseError("Cannot find " + episode.fileName + ". The file path seems to be missing"); return; };
            if (!fs.existsSync(episode.filePath)) { raiseError("Cannot find " + episode.fileName + ". The file seems to be missing"); return; };

            // If a file with the same name already exists in the output folder, don't copy again
            if (fs.existsSync(path.join(outputPath, "episodes", episode.fileName))) {
                console.log(`[INFO] A file (${episode.fileName}) wasn't copied due to the project already containing a file with the same name. This should be expected behavior when showing multiples of the same file but it could also be bad if files accidentally were named the same thing.`);
                return;
            };

            // Copy the episode to the output folder
            fs.copyFileSync(episode.filePath, path.join(outputPath, "episodes", episode.fileName));
        });
    });
};

const setUpHandlers = () => {
    ipcMain.handle("start-export", (event, id) => {
        projectExport(id);
    });
};

module.exports = { setUpHandlers };
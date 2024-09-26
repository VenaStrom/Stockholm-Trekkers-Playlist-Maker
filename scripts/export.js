const { ipcMain, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const raiseError = require("./raiseError.js");
const { projectGet, projectFolder } = require("./save/projects.js");

const projectExport = (id) => {
    // Prompt to select the output folder
    const outputFolder = dialog.showOpenDialogSync({
        properties: ["openDirectory"],
        buttonLabel: "Export here",
        title: "Select where the project folder will be exported",
        message: "Select where the project folder will be exported",
    });

    const project = projectGet(id, projectFolder);

    // Sets the output path to the selected folder and the name of the project as a subfolder
    const outputPath = path.join(outputFolder[0], project.name);

    // Creates the project folder in the selected folder.
    // Confirm with the user to overwrite old folder
    if (
        fs.existsSync(outputPath)
        &&
        !dialog.showMessageBoxSync({
            type: "question",
            buttons: ["Yes", "No"],
            title: "Export",
            message: "The project folder already exists. Do you want to overwrite it?",
            defaultId: 1,
            cancelId: 1,
        })
    ) {
        fs.rmdirSync(outputPath, { recursive: true });
    }
    fs.mkdirSync(outputPath);

    // Copies the pause clips to the output folder
    const pauseFolder = path.join(__dirname, "..", "assets", "videos");
    // Copy the entire folder to the output folder under /pauses
    fs.mkdirSync(path.join(outputPath, "pauses"));
    fs.cpSync(pauseFolder, path.join(outputPath, "pauses"), { recursive: true });
};

const setUpHandlers = () => {
    ipcMain.handle("start-export", (event, id) => {
        projectExport(id);
    });
};

module.exports = { setUpHandlers };
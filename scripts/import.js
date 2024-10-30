const { ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const { projectsFolder } = require("./save/projects.js");

const showDialog = () => {
    return dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
            { name: "JSON Files", extensions: ["json"] },
            { name: "All Files", extensions: ["*"] },
        ],
        buttonLabel: "Import",
        message: "Select a JSON file to import",
        title: "Import Project",
    }).then((result) => {
        if (!result.canceled) {
            const filePath = result.filePaths[0];
            const fileName = path.basename(filePath);

            // Make sure the projects folder exists
            if (!fs.existsSync(projectsFolder)) {
                fs.mkdirSync(projectsFolder);
            }

            // If the file already exists, don't copy it
            if (fs.existsSync(path.join(projectsFolder, fileName))) {
                console.log(`[WARN] A file (${fileName}) wasn't copied due to the project already containing a file with the same name. This should be expected behavior when showing multiples of the same file but it could also be bad if files accidentally were named the same thing.`);
            } else {
                fs.copyFileSync(filePath, path.join(projectsFolder, fileName));
            }
        }

        return;
    });
};

const setUpHandlers = () => {
    ipcMain.handle("import", (event) => {
        return showDialog();
    });
};

module.exports = { setUpHandlers };
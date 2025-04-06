const { ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { saveFilesFolder } = require("../filePaths.js");

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
        defaultPath: path.join(os.homedir()),
        
    }).then((result) => {
        if (!result.canceled) {
            const filePath = result.filePaths[0];
            const fileName = path.basename(filePath);

            // Make sure the projects folder exists
            if (!fs.existsSync(saveFilesFolder)) {
                fs.mkdirSync(saveFilesFolder);
            }

            // Ask to overwrite if the file already exists
            if (fs.existsSync(path.join(saveFilesFolder, fileName))) {
                const result = dialog.showMessageBoxSync({
                    type: "warning",
                    title: "File Already Exists. Overwrite?",
                    message: `A file named ${fileName} already exists in the projects folder. Do you want to overwrite it?`,
                    buttons: ["Yes", "No"],
                    defaultId: 1,
                })
                if (result === 0) {
                    fs.rmSync(path.join(saveFilesFolder, fileName));
                    fs.copyFileSync(filePath, path.join(saveFilesFolder, fileName));
                }
            } else {
                fs.copyFileSync(filePath, path.join(saveFilesFolder, fileName));
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
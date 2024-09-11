const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("node:path");

ipcMain.handle("get-projects", async () => {
    const projects = [];

    const projectFolder = path.join(__dirname, "../../user-data/projects/");

    if (!fs.existsSync(projectFolder)) {
        fs.mkdirSync(projectFolder, { recursive: true });

        return false;
    };
});
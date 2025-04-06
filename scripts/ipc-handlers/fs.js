const { ipcMain } = require("electron");
const fs = require("node:fs");


const ipcHandlers = () => {
    ipcMain.handle("fs-exists-sync", (_, path) => {
        return fs.existsSync(path);
    });
};

module.exports = { ipcHandlers };
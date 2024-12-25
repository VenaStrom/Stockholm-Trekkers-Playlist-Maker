"use strict";
require("../extend/console.js"); // Adds more verbose logging to the console and colors!

const { dialog, ipcMain } = require("electron");

const ipcHandlers = () => {
    // Confirm unsaved changes
    ipcMain.handle("confirm-leave-unsaved", async (event, message) => {
        const response = dialog.showMessageBoxSync({
            type: "info",
            buttons: ["Save and Leave", "Leave with unsaved changes", "Cancel"],
            defaultId: 2,
            cancelId: 2,
            title: "Unsaved changes",
            message: "You have unsaved changes. Do you want to leave?",
        });

        return response;
    });

    // Confirm exporting is in progress
    ipcMain.handle("confirm-leave-exporting", async (event, message) => {
        const response = dialog.showMessageBoxSync({
            type: "info",
            buttons: ["Leave", "Cancel"],
            defaultId: 1,
            cancelId: 1,
            title: "Export in progress",
            message: "An export is in progress. Are you sure you want to leave?",
        });

        return response;
    });
};

module.exports = { ipcHandlers };
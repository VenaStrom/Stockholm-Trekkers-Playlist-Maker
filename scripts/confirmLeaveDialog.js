const { dialog, ipcMain } = require("electron");

const setUpHandlers = () => {
    ipcMain.handle("confirm-leave", async (event, message) => {
        const response = dialog.showMessageBoxSync({
            type: "question",
            buttons: ["Leave", "Save and Leave", "Cancel"],
            defaultId: 2,
            cancelId: 2,
            title: "You have unsaved changes",
            message: "You have unsaved changes. Do you want to leave?",
        });

        return response;
    });
};

module.exports = { setUpHandlers };
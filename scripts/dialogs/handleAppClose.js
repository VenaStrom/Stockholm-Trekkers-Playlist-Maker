const { dialog, BrowserWindow } = require("electron");

const onClose = (event) => {
    // Check if the window title contains any of the strings that require confirmation
    const mainWindow = BrowserWindow.getAllWindows().find(window => window.isMain);
    const isUnsaved = mainWindow.getTitle().includes("*");

    if (!isUnsaved) return; // Just close

    const quitConfirmation = dialog.showMessageBoxSync({
        type: "question",
        buttons: ["Yes, close", "No, stay"],
        title: "Confirm",
        message: "Are you sure you want to close? You may have unsaved changes.",
        defaultId: 1,
        cancelId: 1,
    });

    // If no, prevent closing
    if (quitConfirmation === 1) {
        event.preventDefault();
    }
};

const onClosed = (event) => {
    BrowserWindow.getAllWindows().forEach(window => {
        window.close();
    });
};

module.exports = { onClose, onClosed };
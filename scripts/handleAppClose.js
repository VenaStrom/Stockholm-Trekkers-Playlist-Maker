const { dialog, BrowserWindow } = require("electron");

// If any of these strings appear in the window title the app will prompt the user to confirm closing
const closeConfirmationStrings = ["*"];

const onClose = (mainWindow) => {
    // Handle how the app closes
    mainWindow.on("close", (event) => {

        // Check if the window title contains any of the strings that require confirmation
        const title = mainWindow.getTitle();
        const needsConfirmation = closeConfirmationStrings.some(string => title.includes(string));

        if (!needsConfirmation) return; // Just close

        const quitConfirmation = dialog.showMessageBoxSync({
            type: "question",
            buttons: ["Yes", "No"],
            title: "Confirm",
            message: "Are you sure you want to leave? You may have unsaved changes.",
            defaultId: 1,
        });

        if (quitConfirmation === 1) { // If no, stop from closing
            event.preventDefault();
        }
    });
};

const onClosed = (mainWindow) => {
    // Make sure all windows are closed when the main window is closed
    mainWindow.on("closed", () => {
        BrowserWindow.getAllWindows().forEach(window => {
            window.close();
        });
    });
};

module.exports = { onClose, onClosed };
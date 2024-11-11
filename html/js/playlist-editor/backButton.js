const backButton = document.querySelector("#back-button");

// Helper functions for the back button //
// Does the user confirm leaving?
const confirmUnsavedChanges = () => {
    return confirm("You have unsaved changes. Are you sure you want to leave?")
};

// Is it not saved?
const isSaved = () => {
    return document.getElementsByTagName("TITLE")[0].text.includes("*");
};

// Are we exporting?
const isExporting = () => {
    return !document.querySelector(".export-progress-window").classList.contains("hidden");
};

// Ask to save if the user has unsaved changes
const askToSave = () => {
    return confirm("You have unsaved changes. Do you want to save? You will not leave this page.");
};


// When clicking back button, confirm that the user actually wants to leave
backButton.addEventListener("click", () => {

    if (!isSaved()) {
        if (askToSave()) {
            saveProject();
            return; // Don't leave the page
        }
    }

    if (
        !isSaved()
        ||
        isExporting()
    ) {
        if (confirmUnsavedChanges()) {
            // User confirmed to leave with unsaved changes
            window.location.href = "./projects.html";
        } else {
            // Stay on the current page
            return;
        };
    } else {
        // Go back to the projects page
        // This is the default action 
        window.location.href = "./projects.html";
    };
});

// Ctrl + R confirmation to prevent unwanted refresh
document.addEventListener("keydown", (event) => {
    if (
        (event.ctrlKey && event.key === "r")
        &&
        (
            !isSaved()
            ||
            isExporting()
        )
        &&
        !confirmUnsavedChanges()
    ) {
        event.preventDefault();
    };
});
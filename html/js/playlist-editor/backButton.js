const backButton = document.querySelector("#back-button");

// Helper functions for the back button //
// Does the user confirm leaving?
const confirmUnsavedChanges = () => {
    return confirm("You have unsaved changes or you are currently exporting a project. Are you sure you want to leave?")
};

// Is it not saved?
const isSaved = () => {
    return !document.querySelector("header #save-status").textContent.includes("*");
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
// Ctrl + W confirmation to prevent unwanted close
document.addEventListener("keydown", (event) => {
    if (
        (
            (event.ctrlKey && event.key === "r")
            ||
            (event.ctrlKey && event.key === "w")
        )
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
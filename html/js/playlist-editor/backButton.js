const backButton = document.querySelector("#back-button");

// Helper functions for the back button //
// Is it not saved?
const isSaved = () => {
    return !document.getElementsByTagName("TITLE")[0].text.includes("*");
};

// Are we exporting?
const isExporting = () => {
    // Is export window visible?
    return !document.querySelector(".export-progress-window").classList.contains("hidden");
};

// Does the user confirm leaving?
const confirmRefresh = () => {
    return confirm("You have unsaved changes. Are you sure you want to refresh?")
};

const confirmLeave = () => {
    return confirm("You have unsaved changes. Are you sure you want to leave?");
};

// Ask to save if the user has unsaved changes
const savePrompt = () => {
    return confirm("You have unsaved changes. Do you want to save? You will not leave this page.");
};


// When clicking back button, confirm that the user actually wants to leave
backButton.addEventListener("click", () => {

    // Normal back button behavior
    if (isSaved() && !isExporting()) {
        window.location.href = "./projects.html";
        return;
    }

    if (!isSaved() || isExporting()) {
        dialog.leavingWarning().then((response) => {
            if (response === 0) {
                // User confirmed to leave with unsaved changes
                window.location.href = "./projects.html";

            } else if (response === 1) {
                // Save and leave
                saveProject();
                setTimeout(() => {
                    window.location.href = "./projects.html";
                }, 100);

            } else {
                // Stay on the current page
                return;
            }
        });
    }
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
        !confirmRefresh()
    ) {
        event.preventDefault();
    };
});
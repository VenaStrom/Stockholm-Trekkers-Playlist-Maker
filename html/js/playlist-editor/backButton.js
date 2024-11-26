const backButton = document.querySelector("#back-button");

// Helper functions for the back button //
// Is it not saved?
const isSaved = () => {
    return !document.title.includes("*");
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

const goToProjectsPage = () => {
    window.location.href = "./projects.html";
}

// When clicking back button, confirm that the user actually wants to leave
backButton.addEventListener("click", () => {

    // Regular back button behavior
    if (isSaved() && !isExporting()) {
        goToProjectsPage();
        return;
    }

    if (!isSaved()) {
        dialog.confirmLeaveUnsaved().then((response) => {
            if (response === 0) {
                // Save and leave
                saveProject();

                // Wait for save to complete, then leave
                const timer = new Date().getTime();
                const leaveTest = () => {
                    if (!document.title.includes("*") || new Date().getTime() - timer > 1000) {
                        goToProjectsPage();
                    }
                    setTimeout(leaveTest, 100);
                }
                leaveTest();
            }
            else if (response === 1) {
                // User confirmed to leave with unsaved changes
                goToProjectsPage();

            } else {
                // Stay on the current page
                return;
            }
        });
    }

    if (isExporting()) {
        dialog.confirmLeaveExporting().then((response) => {
            if (response === 0) {
                // User confirmed to leave with unsaved changes
                goToProjectsPage();

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
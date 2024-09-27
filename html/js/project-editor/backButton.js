const backButton = document.querySelector("#back-button");

// Does the user confirm leaving?
const confirmUnsavedChanges = () => {
    return confirm("You have unsaved changes. Are you sure you want to leave?")
};

// Is it not saved?
const isUnsaved = () => {
    return document.querySelector("header #save-status").textContent.includes("*");
};

// Go back when clicking the back button and confirm
backButton.addEventListener("click", () => {

    if (isUnsaved()) {
        if (confirmUnsavedChanges()) {
            // User confirmed to leave with unsaved changes
            window.location.href = "./projects.html";
        } else {
            // Stay on the current page
            return;
        };
    } else {
        // Go back to the projects page
        window.location.href = "./projects.html";
    };
});

// Ctrl + R confirmation
document.addEventListener("keydown", (event) => {
    if (
        (event.ctrlKey && event.key === "r")
        &&
        isUnsaved()
        &&
        !confirmUnsavedChanges()
    ) {
        event.preventDefault();
    };
});

// Ctrl + W confirmation
document.addEventListener("keydown", (event) => {
    if (
        (event.ctrlKey && event.key === "w")
        &&
        isUnsaved()
        &&
        !confirmUnsavedChanges()
    ) {
        event.preventDefault();
    };
});
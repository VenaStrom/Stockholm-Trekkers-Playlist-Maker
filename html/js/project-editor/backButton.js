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

    if (isUnsaved() && confirmUnsavedChanges()) {
        // User confirmed to leave with unsaved changes
        window.location.href = "/projects";
    } else {
        // Stay on the current page
        return;
    };
});

// Ctrl + R confirmation
document.addEventListener("keydown", (event) => {
    if (
        (event.ctrlKey && event.key === "r")
        &&
        isUnsaved()
        &&
        confirmUnsavedChanges()
    ) {
        // User confirmed to refresh with unsaved changes
        return;
    } else {
        event.preventDefault();
    };
});
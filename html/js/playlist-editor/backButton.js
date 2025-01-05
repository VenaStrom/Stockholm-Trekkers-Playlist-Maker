
const wantsToLeave = () => {
    return confirm("You have unsaved changes. Are you sure you want to leave?");
};

const wantsToRefresh = () => {
    return confirm("You have unsaved changes. Are you sure you want to refresh?");
};

const leavePage = () => {
    window.location.href = "./projects-page.html";
};

// Clicking back button
document.querySelector(".back-button").addEventListener("click", () => {
    if (isUnsaved() && wantsToLeave()) {
        leavePage();
        return;
    }

    if (isSaved()) {
        leavePage();
        return;
    }
});

// Refreshing the page
window.addEventListener("keydown", (event) => {
    if (!event.ctrlKey || event.key !== "r") {
        return;
    }

    if (isUnsaved() && !wantsToRefresh()) {
        event.preventDefault();
        return;
    }
});
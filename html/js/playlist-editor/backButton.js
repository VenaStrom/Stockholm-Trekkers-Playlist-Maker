
const wantsToLeave = () => {
    return confirm("You have unsaved changes. Are you sure you want to leave?");
};

const leavePage = () => {
    window.location.href = "./projects-page.html";
};


document.querySelector(".back-button").addEventListener("click", () => {
    if (
        isUnsaved()
        &&
        wantsToLeave()
    ) {
        leavePage();
        return;
    }

    if (isSaved()) {
        leavePage();
        return;
    }
});
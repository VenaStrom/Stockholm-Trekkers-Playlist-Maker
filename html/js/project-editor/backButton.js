const backButton = document.querySelector("#back-button");

backButton.addEventListener("click", () => {
    if (document.querySelector("header #save-status").textContent.includes("*")) {
        if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
            window.location.href = "./projects.html";
        }
    } else {
        window.location.href = "./projects.html";
    }
});


// Confirm on unsaved refresh
document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "r") {
        if (document.querySelector("header #save-status").textContent.includes("*")) {
            if (!confirm("You have unsaved changes. Are you sure you want to refresh?")) {
                event.preventDefault();
            }
        }
    }
});
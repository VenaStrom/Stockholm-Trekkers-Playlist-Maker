
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("open-file-path")) {
        const exportLocation = event.target.textContent;
        explorer.open(exportLocation.replace(/\\/g, "/"));
    }
});
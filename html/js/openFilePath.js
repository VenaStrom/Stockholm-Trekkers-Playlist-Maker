
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("open-file-path")) {
        const exportLocation = event.target.dataset.filePath;
        explorer.open(exportLocation.replace(/\\/g, "/"));
    }
});
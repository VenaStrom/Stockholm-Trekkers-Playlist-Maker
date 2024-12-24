"use strict";


// HTML elements with the class "open-file-path" will open their data-file-path attribute value to open the file explorer at that location
// E.g.:
// <p class="open-file-path" data-file-path="C:\Users\username\Documents\folder">Open Folder</p>
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("open-file-path")) {
        const exportLocation = event.target.dataset.filePath;
        explorer.open(exportLocation.replace(/\\/g, "/"));
    }
});
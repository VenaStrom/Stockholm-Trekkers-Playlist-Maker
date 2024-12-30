"use strict";

// Buttons with the open-path class will open the path specified in the data-open-path attribute when clicked
document.addEventListener("click", (event) => {
    if (
        event.target.classList.contains("open-path")
        &&
        event.target?.dataset?.openPath
    ) {
        explorer.open(event.target.dataset.openPath);
    }
});
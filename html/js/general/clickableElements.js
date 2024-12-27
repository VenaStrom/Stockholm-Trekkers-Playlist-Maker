"use strict";

// Intercept all key downs and if the target is a clickable element, click it
document.addEventListener("keydown", (event) => {
    // Stop space from scrolling the page
    if (event.key === " ") { event.preventDefault() };

    // Only proceed if the key is "Enter" or "Space"
    if (!(event.key === "Enter" || event.key === " ")) { return; };

    const target = event.target;

    if (
        target.tagName === "button"
        ||
        target.tagName === "input"
        ||
        target.tagName === "a"
    ) {
        event.preventDefault();
        target.click();
    }
});
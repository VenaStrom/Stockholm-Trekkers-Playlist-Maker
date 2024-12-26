"use strict";

// Intercept all keydowns and if the target is a clickable element, click it
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

    // // If it's clickable, click it
    // if (event.target.classList.contains("clickable")) {
    //     event.preventDefault(); // Prevents double clicks if the element is already "enterable"

    //     // If a clickable element has a child, that means it is the one that should be clicked
    //     if (event.target.children.length > 0) {
    //         event.target.children[0].click();
    //     } else {
    //         event.target.click();
    //     }
    // };
});

// Intercept all clicks so clickable elements play nice with the mouse
document.addEventListener("click", (event) => {
    const target = event.target;
    const parent = event.target.parentElement;

    if (parent.classList.contains("clickable")) {
        if (
            target.tagName === "P"
            &&
            parent.querySelector("input")
        ) {
            parent.querySelector("input").click();
        };
    } else if (target.classList.contains("clickable")) {
        if (
            target.querySelector("p")
            &&
            target.querySelector("input")
        ) {
            target.querySelector("input").click();
        };
    };
});
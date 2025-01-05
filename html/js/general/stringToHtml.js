"use strict";

// Load this before any DOM creating scripts
const stringToHTML = (string) => {
    const htmlLaunderer = document.createElement("div");
    htmlLaunderer.innerHTML = string.trim();

    return htmlLaunderer.firstChild;
};

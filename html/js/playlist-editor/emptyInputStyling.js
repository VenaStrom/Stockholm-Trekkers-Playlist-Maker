"use strict";

document.addEventListener("input", () => {
    const allFileInputs = document.querySelectorAll("input[type='file']");

    if (allFileInputs.length === 0 || !allFileInputs) {
        return;
    }

    allFileInputs.forEach(fileInput => {
        const isEmpty = fileInput.files.length === 0;

        if (isEmpty) {
            fileInput.classList.add("empty");
        } else {
            fileInput.classList.remove("empty");
        }
    });
});
"use strict";

// 
// Styling for empty file inputs
// 
const dimEmptyFileInputs = () => {
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
};
document.addEventListener("input", dimEmptyFileInputs);
document.addEventListener("change", dimEmptyFileInputs);
document.addEventListener("DOMContentLoaded", dimEmptyFileInputs);
document.addEventListener("unsavedState", dimEmptyFileInputs);
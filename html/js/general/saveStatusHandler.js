"use strict";

const unsavedStateChar = "*";

const setUnsavedState = () => {
    if (!document.title.includes(unsavedStateChar)) {
        document.title += unsavedStateChar;
    }
};

const setSavedState = () => {
    if (document.title.includes(unsavedStateChar)) {
        document.title = document.title.replaceAll(unsavedStateChar, "");
    }
};

const isSaved = () => {
    return !document.title.includes(unsavedStateChar);
};

const isUnsaved = () => {
    return document.title.includes(unsavedStateChar);
};

document.addEventListener("unsavedState", setUnsavedState);
document.addEventListener("savedState", setSavedState);
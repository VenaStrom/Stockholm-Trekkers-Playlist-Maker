"use strict";

const setUnsavedState = () => {
    if (!document.title.includes("*")) {
        document.title = document.title + "*";
    }
}

const setSavedState = () => {
    if (document.title.includes("*")) {
        document.title = document.title.replace("*", "");
    }
}
"use strict";

const importSaveFile = () => {
    importer.import().then(() => {
        window.location.reload();
    });
};
const importButton = document.querySelector(".import-button");
importButton.addEventListener("click", importSaveFile);


const openSaveFileFolder = async () => {
    explorer.open(await projects.getPath());
};
const openButton = document.querySelector(".open-folder-button");
openButton.addEventListener("click", openSaveFileFolder);

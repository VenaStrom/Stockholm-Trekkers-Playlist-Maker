"use strict";

const importSaveFile = () => {
    importer.import().then(() => {
        window.location.reload();
    });
};
const importButton = document.querySelector(".import-save-file");
importButton.addEventListener("click", importSaveFile);


const openSaveFileFolder = async () => {
    explorer.open(await projects.getPath());
};
const openButton = document.querySelector(".open-saves-folder");
openButton.addEventListener("click", openSaveFileFolder);

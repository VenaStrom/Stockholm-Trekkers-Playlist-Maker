"use strict";


const importSaveFile = () => {
    importer.import().then(() => {
        window.location.reload();
    });
};
const importButton = document.querySelector(".import-button");
importButton.addEventListener("click", importSaveFile);


const openSaveFileFolder = () => {
    appPath.get().then((path) => {
        explorer.open(path + "/user-data/projects");
    });
};
const openButton = document.querySelector(".open-folder-button");
openButton.addEventListener("click", openSaveFileFolder);

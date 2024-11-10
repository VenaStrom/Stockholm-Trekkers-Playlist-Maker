
const importButton = document.querySelector(".import-button");
const openButton = document.querySelector(".open-folder-button");

const importFromFile = () => {
    importer.import().then((data) => {
        window.location.reload();
    });
};
importButton.addEventListener("click", importFromFile);


const openSavesFolder = () => {
    appPath.get().then((path) => {
        explorer.open(path + "/user-data/projects");
    });
};
openButton.addEventListener("click", openSavesFolder);

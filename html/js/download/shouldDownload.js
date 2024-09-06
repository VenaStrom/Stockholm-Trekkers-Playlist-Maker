
const fileExist = async () => {
    return await download.filesExist()
};

fileExist().then((exists) => {
    if (exists) {
        fileExistsBox.textContent = "The necessary files are present. Loading app..."
    } else {
        fileExistsBox.style.display = "none";
        confirmDownloadBox.style.display = "flex";
    }
});
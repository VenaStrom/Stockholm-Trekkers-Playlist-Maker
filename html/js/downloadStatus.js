
const progressBar = document.getElementById("download-progress-bar");
const bottomStatusText = document.getElementById("bottom-status-text");
const topStatusText = document.getElementById("top-status-text");

const updateInfoBox = async () => {
    const status = await downloadStatus.get();
    const currentFile = status.currentFile;


    if (status.status === "progressing") {
        topStatusText.textContent = `Some additional content needs to be downloaded, please wait... (${status.atFile}/${status.fileCount})`;
        progressBar.style.backgroundSize = currentFile.percent + "%";
        bottomStatusText.textContent = `Downloading ${(currentFile.received / 1024 / 1024).toFixed(2)} / ${(currentFile.size / 1024 / 1024).toFixed(0)} MB`;
    } else if (status.status === "paused") {
        bottomStatusText.textContent = "Download paused";
    } else if (status.status === "interrupted") {
        bottomStatusText.textContent = "Download interrupted";
    } else if (status.status === "completed") {
        bottomStatusText.textContent = "Download completed";
        progressBar.style.backgroundSize = "100%";
    } else {
        bottomStatusText.textContent = "Download not started";
    }
}

setInterval(updateInfoBox,100);
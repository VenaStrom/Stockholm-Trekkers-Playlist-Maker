
confirmDownloadBox.querySelector("button").addEventListener("click", () => {
    confirmDownloadBox.style.display = "none";
    progressBox.style.display = "flex";
    
    download.start();
});
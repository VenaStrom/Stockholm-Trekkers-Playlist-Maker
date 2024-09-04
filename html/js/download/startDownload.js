
const confirmWindow = document.querySelector(".confirm-download-window");
const progressWindow = document.querySelector(".download-progress-window");

confirmWindow.querySelector("button").addEventListener("click", () => {
    confirmWindow.style.display = "none";
    progressWindow.style.display = "flex";
    
    ipcRenderer.invoke("start-download");
});
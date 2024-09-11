
const checkingForFilesWindow = document.getElementById("checking-for-files");
const confirmDownloadWindow = document.getElementById("confirm-download");
const progressWindow = document.getElementById("progress-window");

// Check for files
// Show "checking for files" window
checkingForFilesWindow.classList.remove("hidden");
download.filesExist().then((filesExist) => {
    console.log(filesExist);
    if (filesExist) {
        checkingForFilesWindow.querySelector("p").textContent = "Files found. Moving on...";

        setTimeout(() => {
            switchPage();
        }, 1000);

    } else {
        // Show download confirmation
        confirmDownloadWindow.classList.remove("hidden");
        checkingForFilesWindow.classList.add("hidden");
    }
});

// Confirm download
confirmDownloadWindow.querySelector("button").addEventListener("click", () => {
    confirmDownloadWindow.classList.add("hidden");
    progressWindow.classList.remove("hidden");
    download.start();
});

// Progress
const progressBar = progressWindow.querySelector("#progress-bar");
const topStatusText = progressWindow.querySelectorAll("p")[0];
const bottomStatusText = progressWindow.querySelectorAll("p")[1];
const progressUpdate = setInterval(() => {
    download.status().then((status) => {
        if (status.status === "starting") {
            topStatusText.textContent = "Settings things up, please wait...";
            bottomStatusText.textContent = "Download will start soon.";

        } else if (status.status === "downloading") {
            topStatusText.textContent = "Downloading video files, please wait... (" + status.atFile + "/" + status.fileCount + ")";
            bottomStatusText.textContent = `Downloading ${status.received} / ${status.size} MB (${status.percent}%)`;

            progressBar.style.backgroundSize = status.percent + "%";
            console.log(progressBar);
        } else if (status.status === "completed") {
            clearInterval(progressUpdate);
            topStatusText.textContent = "Downloads completed. Moving on...";

            progressBar.style.backgroundSize = "100%";

            setTimeout(() => {
                switchPage();
            }, 1000);

        } else if (status.status === "failed") {
            clearInterval(progressUpdate);
            topStatusText.textContent = "Downloads failed.";
            bottomStatusText.textContent = "Please try again. If it still fails, contact Viggo.";
            progressBar.classList.add("warning");
        }
    });
}, 100);

// Switch page
const switchPage = () => { };
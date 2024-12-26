"use strict";

const infoBox = document.querySelector(".round-box");

const displayMoveOnPrompt = async () => {
    infoBox.innerHTML = `
        <div class="header">
            Ready To Move On
        </div>

        <div class="main">
            <p>
                All necessary files have been downloaded. The files can be found at 
            </p>
            <button class="open-path">${await assets.getPath()}</button>
    
            <button onclick="switchPage()">Continue</button>
        </div>`;
};

const displayDownloadFilesPrompt = () => {
    infoBox.innerHTML = `
        <div class="header">
            Download Files
        </div>
    
        <div class="main">
            <p>
                Some video files need to be downloaded in order to use this application. The files are roughly 400 MB in total.
            </p>

            <button onclick="downloadAssets()">Download</button>
        </div>`;
};

// Check if any file downloads are necessary
assets.allExist().then((theyExist) => {
    if (theyExist) {
        displayMoveOnPrompt();
    } else {
        displayDownloadFilesPrompt();
    }
});

const downloadAssets = () => {
    
};

const switchPage = () => {
    window.location.href = "./projects-page.html";
};

// const checkingForFilesWindow = document.getElementById("checking-for-files");
// const confirmMoveOnWindow = document.getElementById("confirm-move-on");
// const confirmDownloadWindow = document.getElementById("confirm-download");
// const progressWindow = document.getElementById("progress-window");

// // Check for files
// // Show "checking for files" window
// checkingForFilesWindow.classList.remove("hidden");
// download.filesExist().then((filesExist) => {
//     setTimeout(() => {
//         if (filesExist) {
//             checkingForFilesWindow.querySelector("p").textContent = "Files found. Moving on...";

//             checkingForFilesWindow.classList.add("hidden");
//             confirmMoveOnWindow.classList.remove("hidden");

//         } else {
//             // Show download confirmation
//             confirmDownloadWindow.classList.remove("hidden");
//             checkingForFilesWindow.classList.add("hidden");
//         };
//     }, 100);
// }).catch((error) => {
//     console.error(error);
// });

// // Confirm download
// confirmDownloadWindow.querySelector("button").addEventListener("click", () => {
//     confirmDownloadWindow.classList.add("hidden");
//     progressWindow.classList.remove("hidden");
//     download.start();

//     // Prompt the user to save the state
//     setUnsavedState();
// });

// // Switch page
// const switchPage = () => {
//     window.location.href = "./projects-page.html";
// };

// // Progress update
// const progressBar = progressWindow.querySelector("#progress-bar");
// const topStatusText = progressWindow.querySelectorAll("p")[0];
// const bottomStatusText = progressWindow.querySelectorAll("p")[1];
// const progressUpdate = setInterval(() => {
//     download.status().then((status) => {
//         if (status.status === "starting") {
//             topStatusText.textContent = "Settings things up, please wait...";
//             bottomStatusText.textContent = "Download will start soon.";

//         } else if (status.status === "downloading") {
//             topStatusText.textContent = `Downloading video files, please wait... (${status.atFile}/${status.fileCount})`;
//             bottomStatusText.textContent = `Downloading ${status.received} / ${status.size} MB (${status.percent}%)`;

//             progressBar.style.backgroundSize = `${status.percent}%`;

//         } else if (status.status === "completed") {
//             clearInterval(progressUpdate);
//             topStatusText.textContent = "Downloads completed.";
//             bottomStatusText.textContent = `Downloading ${status.size} / ${status.size} MB (100%)`;

//             progressBar.style.backgroundSize = "100%";

//             appPath.get().then((path) => {
//                 const videosFolder = `${path}\\assets\\videos`; // Definitely not the best way to do this cause of Linux
            
//                 bottomStatusText.innerHTML = `Files downloaded to:<span class="open-file-path clickable" data-file-path="${videosFolder}"><br>${videosFolder}</span>.<br>Moving on...`;
//             });

//             // Allow for unhindered reloading and leaving
//             setSavedState();

//             // Switch page after a short delay, this is not final
//             setTimeout(() => {
//                 switchPage();
//             }, 500);

//         } else if (status.status === "failed") {
//             clearInterval(progressUpdate);
//             topStatusText.textContent = "Downloads failed.";
//             bottomStatusText.textContent = "Please try again. If it still fails, contact Viggo.";
//             progressBar.classList.add("warning");
//         };
//     });
// }, 100);

// // Confirm to switch page
// confirmMoveOnWindow.querySelector("button").addEventListener("click", () => {
//     switchPage();
// });

// // Set the open-file-path div text content to the app path
// appPath.get().then((path) => {
//     document.querySelector(".open-file-path").dataset.filePath = `${path}\\assets\\videos`;
// }); 
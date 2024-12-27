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
                <button class="open-path" data-open-path="${await assets.getPath()}">here</button>.
            </p>
    
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

const displayProgressPrompt = () => {
    infoBox.innerHTML = `
        <div class="header">
            Downloading...
        </div>
    
        <div class="main">
            <p>
                Getting things ready, please wait...
            </p>
            <span class="progress-bar"></span>
        </div>`;

    const progressInterval = setInterval(() => {
        assets.getStatus().then((status) => {
            const statusText = infoBox.querySelector("p");
            infoBox.querySelector(".progress-bar").classList.remove("warning"); // Reset error state


            if (status.status === "starting") {
                statusText.textContent = "Getting things ready, please wait...";
                return;
            } 
            
            if (status.status === "downloading") {
                statusText.innerHTML = `Downloading video files...<br>
                    <div class="justify-between">
                        <p>Current file: ${status.name} ${status.received} / ${status.size} MB (${status.percent}%)</p>
                        <p>${status.atFile} / ${status.fileCount} files.</p>
                    </div>`;

                infoBox.querySelector(".progress-bar").style.backgroundSize = `${status.percent}%`;
                return;
            }

            if (status.status === "completed") {
                clearInterval(progressInterval);

                console.info("Download completed.");
                
                statusText.textContent = "Downloads completed.";

                infoBox.querySelector(".progress-bar").style.backgroundSize = "100%";

                displayMoveOnPrompt();
                return;
            } 

            if (status.status === "failed") {
                clearInterval(progressInterval);

                console.error("Download failed.");

                statusText.innerHTML = `Downloads failed. Please restart the application and try again. If the issue persists, contact ${document.querySelector("footer>p>a").outerHTML}`; // Gets the email from the footer

                infoBox.querySelector(".progress-bar").style.backgroundSize = "100%";
                infoBox.querySelector(".progress-bar").classList.add("warning");
                return;
            }
        });
    }, 250);
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
    assets.download(); // Async

    displayProgressPrompt();
};

const switchPage = () => {
    window.location.href = "./projects-page.html";
};
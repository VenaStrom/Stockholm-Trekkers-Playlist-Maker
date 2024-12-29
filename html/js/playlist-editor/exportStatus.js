"use strict";

const startExportProcess = () => {
    // Helpers
    const disablePageInteraction = () => {
        // Class defined in playlist-editor.scss
        document.body.classList.add("stop-page-interactions");

        // Stop tabbing
        document.querySelectorAll("*[tabindex], button, a, input").forEach(element => {
            element.tabIndex = -1;
        });
    };
    const enablePageInteraction = () => {
        // Class defined in playlist-editor.scss
        document.body.classList.remove("stop-page-interactions");

        // Enable tabbing
        document.querySelectorAll("*[tabindex], button, a, input").forEach(element => {
            element.tabIndex = 0;
        });
    };
    const openWindow = () => {
        disablePageInteraction();
        document.body.appendChild(exportWindow);
    };
    const closeWindow = () => {
        exportWindow.remove();
        enablePageInteraction();
    };

    // Create window with info about exporting
    const exportWindow = stringToHTML(`
    <div class="export-overlay">
        <div class="round-box">
            <div class="header">
                <p>Good to Know About Exporting</p>
            </div>
    
            <div class="main">
                <ul>
                    <li>Avoid exporting to a USB drive. <a href="https://github.com/viggoStrom/Stockholm-Trekkers-Playlist-Maker/blob/main/docs/information-about-exporting.md">Learn more</a></li>
                    <li>A playlist can be 20 GB or more.</li>
                    <li>The exported folder is not zipped.</li>
                </ul>
        
                <button class="start-export">I understand, continue</button>
            </div>
        </div>
    </div>`);

    // Button functionality
    exportWindow.querySelector("button.start-export").addEventListener("click", () => {
        exporter.start(getID());
        displayExportStatus();
    });

    openWindow();

    const displayExportStatus = () => {
        const updateInterval = 100; // ms

        const status = {
            progress: "0%",
            message: "Setting things up...",
            status: "exporting",
            exportLocation: null,
        };

        // Update the window so it shows progress
        exportWindow.querySelector(".round-box").innerHTML = `
        <div class="header">
            <p>Exporting</p>
        </div>

        <div class="main">
            <p class="status-text">${status.message}</p>

            <button class="open-path" data-open-path="${status.exportLocation}">Exporting here</button>

            <div>
                <span class="progress-bar"></span>
            </div>

            <button class="cancel">Cancel</button>
        </div>`;

        // Intervals
        const statusFetcher = setInterval(async () => {
            exporter.getStatus().then((newStatus) => {
                status.progress = newStatus.progress;
                status.message = newStatus.message;
                status.status = newStatus.status;
                status.exportLocation = newStatus.exportLocation;
            });
        }, updateInterval);
        const statusUpdater = setInterval(async () => {
            // Progress bar
            const progressBar = exportWindow.querySelector(".progress-bar");
            progressBar.style.backgroundSize = status.progress;

            // Status text
            const statusText = exportWindow.querySelector(".status-text");
            statusText.innerHTML = status.message;

            // Link to export location
            const openPathButton = exportWindow.querySelector(".open-path");
            openPathButton.dataset.openPath = status.exportLocation;

            // Status check
            if (status.status === "error") {
                displayErrorState();
                return;
            }
            if (status.status === "cancelled") {
                displayCancelState();
                return;
            }
            if (status.status === "success") {
                displaySuccessState();
                return;
            }
        }, updateInterval);

        const stopIntervals = () => {
            clearInterval(statusFetcher);
            clearInterval(statusUpdater);
        };

        // Cancel button functionality
        exportWindow.querySelector("button.cancel").addEventListener("click", () => {
            exporter.cancel();
            stopIntervals();
            closeWindow();
        });

        // 
        // Display States
        // 
        const displayErrorState = () => {            
            stopIntervals();
            exporter.cancel();

            exportWindow.querySelector(".round-box").innerHTML = `
            <div class="header">
                <p>Error During Export</p>
            </div>

            <div class="main">
                <p class="status-text">${status.message}</p>

                <div>
                    <span class="progress-bar warning"></span>
                </div> 

                <button class="close">Close</button>
            </div>`;

            // Set progress bar to 100%
            const progressBar = exportWindow.querySelector(".progress-bar");
            progressBar.style.backgroundSize = "100%";

            // Cancel button functionality
            exportWindow.querySelector("button.close").addEventListener("click", () => {
                closeWindow();
            });
        };
        const displayCancelState = () => {
            stopIntervals();
            exporter.cancel();

            exportWindow.querySelector(".round-box").innerHTML = `
            <div class="header">
                <p>Export Cancelled</p>
            </div>

            <div class="main">
                <p class="status-text">${status.message}</p>

                <div>
                    <span class="progress-bar warning"></span>
                </div> 

                <button class="close">Close</button>
            </div>`;

            // Set progress bar to 100%
            const progressBar = exportWindow.querySelector(".progress-bar");
            progressBar.style.backgroundSize = "100%";

            // Cancel button functionality
            exportWindow.querySelector("button.close").addEventListener("click", () => {
                closeWindow();
            });
        };
        const displaySuccessState = () => {
            stopIntervals();

            exportWindow.querySelector(".round-box").innerHTML = `
            <div class="header">
                <p>Export Complete</p>
            </div>

            <div class="main">
                <p class="status-text">${status.message}</p>

                <button class="open-path" data-open-path="${status.exportLocation}">Open Export Location</button>

                <div>
                    <span class="progress-bar"></span>
                </div>

                <button class="cancel">Close</button>
            </div>`;

            // Set progress bar to 100%
            const progressBar = exportWindow.querySelector(".progress-bar");
            progressBar.style.backgroundSize = "100%";

            // Cancel button functionality
            exportWindow.querySelector("button.cancel").addEventListener("click", () => {
                closeWindow();
            });
        };
    };
};
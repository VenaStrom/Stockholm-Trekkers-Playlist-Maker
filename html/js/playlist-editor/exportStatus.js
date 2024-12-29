"use strict";

const startExportProcess = () => {
    const exportOverlayAndWindow = stringToHTML(`
    <div class="export-overlay">
        <div class="round-box">
            <div class="header">
                <p>Good to Know About Exporting</p>
            </div>

            <div class="main">
        
            </div>
        </div>
    </div>`);

    const stopPageInteraction = () => {
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

    const addWindowToDOM = () => {
        stopPageInteraction();
        document.body.appendChild(exportOverlayAndWindow);
    };

    addWindowToDOM();

    const displayExportStatus = () => {
        const statusUpdateInterval = 100; // ms

        const status = {
            progress: "0%",
            message: "Setting things up...",
            exportLocation: null,
        };

        // Update the window so it shows progress
        exportOverlayAndWindow.querySelector("round-box").innerHTML = `
        <div class="header">
            <p>Exporting</p>
        </div>

        <div class="main">
            <p class="status-text">${status.message}</p>

            <div>
                <span class="progress-bar"></span>
            </div>

            <button class="cancel">Cancel</button>
        </div>`;

        const statusFetcher = setInterval(async () => {
            exporter.getStatus().then((newStatus) => {
                status.progress = newStatus.progress;
                status.message = newStatus.message;
                status.exportLocation = newStatus.exportLocation;
            });
        }, statusUpdateInterval);

        const statusUpdater = setInterval(async () => {
            // Progress bar
            const progressBar = exportOverlayAndWindow.querySelector(".progress-bar");
            progressBar.style.backgroundSize = status.progress;

            // Status text
            const statusText = exportOverlayAndWindow.querySelector(".status-text");
            statusText.innerHTML = `
                ${status.message}
                <button class="open-path" data-open-path="${status.exportLocation}">Exporting to...</button>
            `.trim();
        });

        const cancelExport = () => {
            exporter.cancel(); // Tell main to stop

            clearInterval(statusFetcher);
            clearInterval(statusUpdater);

            exportOverlayAndWindow.remove(); // Remove window
            enablePageInteraction();
        };

        // Cancel button functionality
        exportOverlayAndWindow.querySelector("button.cancel").addEventListener("click", cancelExport);
    };

    displayExportStatus();
};
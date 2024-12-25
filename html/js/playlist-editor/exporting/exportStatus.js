"use strict";

const topStatusMessage = document.querySelectorAll(".export-progress-window .status-text")[0];
const bottomStatusMessage = document.querySelectorAll(".export-progress-window .status-text")[1];
const progressBar = document.getElementById("export-progress-bar");
const cancelButton = document.querySelector(".export-progress-window button.cancel");

const startingTopStatusMessage = topStatusMessage.textContent;

// Runs when the export starts and regularly gets the status of the export from the backend 
const startExportStatusGetter = () => {

    // Makes the user confirm refreshing and leaving the page
    setUnsavedState();

    // Show the export progress window
    document.querySelector(".export-progress-window").classList.remove("hidden");

    // Reset the status messages and progress bar in case the user has already exported something
    topStatusMessage.textContent = startingTopStatusMessage;
    bottomStatusMessage.textContent = "Setting things up...";
    progressBar.style.backgroundSize = "0%";
    bottomStatusMessage.classList.remove("hidden");

    // Every 100ms, get the status of the export
    const statusInterval = setInterval(() => {
        exporter.getStatus().then((status) => {

            // Update the HTML
            bottomStatusMessage.textContent = status.message;
            progressBar.style.backgroundSize = status.progress;

            // When done, clear the interval
            if (status.message.includes("Done")) {
                
                // Allow for unhindered page refresh and leave
                setSavedState();

                // Set the button text to "Done"
                cancelButton.textContent = "Done";

                topStatusMessage.innerHTML = `The export has finished! The playlist is saved at<br>
                <span class="open-file-path" tabindex="0" data-file-path="${status.exportLocation}">${status.exportLocation}</span>`;

                bottomStatusMessage.classList.add("hidden");

                clearInterval(statusInterval);
            }
        });
    }, 100);
};

// Cancellation
cancelButton.addEventListener("click", (event) => {

    // If cancel button is clicked, cancel the export
    if (cancelButton.textContent.includes("Cancel")) {
        exporter.cancel();
    }

    // Reset the button text
    document.querySelector(".bottom-sticky-container>.export-progress-window button.cancel").textContent = "Cancel";

    // Hide the export progress window
    document.querySelector(".bottom-sticky-container>.export-progress-window").classList.add("hidden");
});
"use strict";

const JSONifyProject = () => {
    const projectData = {
        date: document.querySelector(".date-input input[type='text']").value,
        id: getID(),
        dateModified: new Date().getTime(),
        blocks: [],
    };

    const blocks = document.querySelectorAll(".block");

    blocks.forEach((block) => {
        const options = [...blockOptions];
        block.querySelectorAll(".options-dropdown input[type='checkbox']").forEach(optionCheckbox => {
            options.find(option => option.id === optionCheckbox.dataset.id).checked = optionCheckbox.checked;
        });

        const episodes = Array.from(block.querySelectorAll(".episode"))
            .filter(episode => episode.querySelector("input[type='file']").files.length !== 0)
            .map(episode => {
                const fileInput = episode.querySelector("input[type='file']");
                const timeDOM = episode.querySelector("p");
                return {
                    filePath: fileInput.dataset.filePath || "",
                    startTime: timeDOM.textContent || "",
                    endTime: timeDOM.dataset.endTime || "",
                    duration: fileInput.dataset.duration || 0,
                };
            });

        projectData.blocks.push({
            startTime: block.querySelector(".header .start-time input[type='text']").value,
            options: options,
            episodes: episodes,
        });
    });

    return projectData;
};

const saveProject = () => {
    console.info("Saving project...");

    const projectData = JSONifyProject();

    return projects.save(projectData).then((response) => {
        if (response) {
            console.info("Project saved successfully");
            document.dispatchEvent(new Event("savedState"));
        } else {
            console.error("Project save failed");
        }
    });
}

// CTRL + S to save
document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "s") {
        saveProject();
    }
});

// Save button
const saveButton = document.querySelector("button.save");
saveButton.addEventListener("click", () => { saveProject(); });

// Export button
const exportButton = document.querySelector("button.export");
exportButton.addEventListener("click", () => {
    saveProject().then(() => {
        startExportProcess();
    });
});

// Save indicator in the header
document.addEventListener("unsavedState", () => {
    const saveIndicator = document.querySelector(".save-indicator");
    saveIndicator.textContent = "Unsaved changes*";
    saveIndicator.classList.remove("hidden");
});
document.addEventListener("savedState", () => {
    const saveIndicator = document.querySelector(".save-indicator");
    saveIndicator.textContent = "Saved";

    setTimeout(() => {
        // After a while, if the state is still saved, hide the indicator
        if (isSaved()) {
            saveIndicator.classList.add("hidden");
        }
    }, 2000);
});

// On any change, tell everyone that the state is unsaved
document.addEventListener("change", () => {
    document.dispatchEvent(new Event("unsavedState"));
});

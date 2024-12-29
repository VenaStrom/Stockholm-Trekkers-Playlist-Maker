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
            .filter(episode => episode.querySelector("input[type='file']").value)
            .map(episode => {
                const fileInput = episode.querySelector("input[type='file']");
                const timeDOM = episode.querySelector("p");
                return {
                    filePath: fileInput.dataset.filePath || null,
                    fileName: fileInput.dataset.filePath?.split(/[/\\]/)?.at(-1) || null,
                    startTime: timeDOM.textContent || null,
                    endTime: timeDOM.dataset.endTime || null,
                    duration: timeDOM.dataset.duration || null,
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

// Save button and save & export button
const saveButton = document.querySelector("button.save");
saveButton.addEventListener("click", () => { saveProject(); });
const exportButton = document.querySelector("button.export");
exportButton.addEventListener("click", () => {
    saveProject().then(() => {
        console.info("exporting...");
    });
});
"use strict";

const id = getID();

const loadProjectData = async (id) => {
    if (id === "new") {
        return;
    }

    let projectData = await projects.get(id);

    if (!projectData) {
        console.warn(`No project found with id: ${id}`);
        projectData = {
            date: "",
            blocks: [],
        };
    }

    // Set the date input
    const dateInput = document.querySelector(".date-input input[type='text']");
    dateInput.value = projectData.date;
    dateInput.addEventListener("blur", (event) => {
        event.target.value = interpretDate(event.target.value);
        event.target.dispatchEvent(new Event("validate-date"));
    });
    dateInput.dispatchEvent(new Event("blur"));

    // Load all blocks, one at a time
    projectData.blocks.forEach(blockData => {
        createBlock(blockData);
    });
    // Make sure there is at least 1 block
    if (document.querySelectorAll(".block").length === 0) {
        createBlock();
    }
};

loadProjectData(id)

"use strict";

const id = getID();

const loadProjectData = async (id) => {
    if (id === "new") {
        return;
    }

    const projectData = await projects.get(id);

    if (!projectData) {
        console.warn(`No project found with id: ${id}`);
        return;
    }

    // Set the date input
    document.querySelector(".date-input input[type='text']").value = projectData.date;

    // Load all blocks, one at a time
    projectData.blocks.forEach(blockData => {
        createBlock(blockData);
    });
};

loadProjectData(id)
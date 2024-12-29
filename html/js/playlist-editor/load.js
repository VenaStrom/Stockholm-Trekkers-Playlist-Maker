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


// // Load project on page load if there is an ID
// if (id !== "new") {
//     projects.get(id).then((project) => {
//         if (!project) {
//             console.warn(`No project found with id: ${id}`);
//             return;
//         }

//         // Set the date input
//         document.querySelector(".date-input input[type='text']").value = project.date;

//         // Load all blocks, one at a time
//         project.blocks.forEach((blockData, blockIndex) => {
//             // Create new blocks if there are not enough
//             if (document.querySelectorAll(".block").length <= blockIndex) {
//                 createBlockDOM(document.querySelector(".create-block"));
//             }

//             const blockDOM = document.querySelectorAll(".block")[blockIndex];

//             // Set the start time of this block
//             blockDOM.querySelector(".header .time input[type='text']").value = blockData.startTime;

//             // Set the options
//             blockData.options.forEach((option, optionIndex) => {
//                 const optionDOM = blockDOM.querySelector(`.options input#${option.id}`);
//                 // If the option still exists, set its checked state
//                 if (optionDOM) {
//                     optionDOM.checked = blockData.options[optionIndex].checked;
//                 }
//             });

//             // Update the dots that represent which options are chosen
//             updateDots(blockDOM.querySelector(".options"));

//             // Load all the episodes of this block, one at a time
//             blockData.episodes.forEach((episode, episodeIndex) => {
//                 // Create new episode DOM if there aren't enough
//                 if (episodeIndex !== 0) {
//                     createEpisodeDOM(blockDOM);
//                 }

//                 const episodeDOM = blockDOM.querySelectorAll(".episode")[episodeIndex];

//                 // This seems to be the only way of setting the file input (visually!!)
//                 // It just makes the input display the file name
//                 const dataTransfer = new DataTransfer();
//                 const file = new File([new Blob()], episode.fileName);
//                 dataTransfer.items.add(file);

//                 const fileInput = episodeDOM.querySelector(".file input[type='file']");
//                 fileInput.files = dataTransfer.files;
//                 fileInput.dataset.filePath = episode.filePath;

//                 const timeDOM = episodeDOM.querySelector(".time p");

//                 timeDOM.textContent = episode.startTime;
//                 timeDOM.dataset.endTime = episode.endTime;
//             });
//         });
//     });
// }
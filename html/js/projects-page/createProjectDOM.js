"use strict";


// <!-- Template project -->
// <div class="round-box load-project-template hidden clickable" tabindex="0">
//     <div class="project-header">
//         <div class="project-date">
//             <p>Trekdag</p>
//             <h3>2024-09-14</h3>
//         </div>

//         <div class="meta-data">
//             <p>2024-08-30</p>
//         </div>

//         <img class="clickable clickable-icon delete-project" tabindex="0"
//             src="../../assets/images/delete_35dp_000000_FILL0_wght700_GRAD0_opsz40.png" alt="Delete">
//     </div>

//     <ul>
//         <li class="block-header">
//             <p>Block 1</p>
//             <div>
//                 <div class="option"></div>
//                 <div class="option"></div>
//                 <div class="option"></div>
//             </div>
//         </li>
//         <li>HH:MM - Episode 1 with a long name</li>
//         <li>HH:MM - Episode 2 with a different long name</li>
//         <li>HH:MM - Episode 3 with another long name</li>
//         <li>HH:MM - Episode 4 with yet another long name</li>
//         <li>HH:MM - Episode 4 with yet another long name</li>
//         <hr>
//         <li class="pause">HH:MM - Pause</li>
//         <hr>
//         <li class="block-header">
//             <p>Block 1</p>
//             <div>
//                 <div class="option"></div>
//                 <div class="option"></div>
//                 <div class="option"></div>
//             </div>
//         </li>
//         <li>HH:MM - Episode 4 with yet another long name</li>
//         <li>HH:MM - Episode 5 with a very long name</li>
//         <li>HH:MM - Episode 6 with yet another long name</li>
//         <li>HH:MM - Episode 7 with a very long name</li>
//         <li>HH:MM - Episode 8 with an extremely long name</li>
//     </ul>
// </div>


// Creates and fills the metadata tag with the date modified
// const createMetadataDOM = (projectData) => {
//     // Decides how to format the time you see by "last modified" 


//     const metadataDOM = document.createElement("div");

//     const lastModifiedText = document.createElement("p");
//     lastModifiedText.textContent = "Last modified: ";

//     const lastModifiedTime = document.createElement("p");
//     lastModifiedTime.textContent = unixTimeToDate(projectData.dateModified);

//     metadataDOM.appendChild(lastModifiedText);
//     metadataDOM.appendChild(lastModifiedTime);

//     return metadataDOM;
// };

// const createPauseDOM = (episodeData) => {
//     const pauseDOM = document.createElement("li");
//     pauseDOM.classList.add("pause");

//     const startTime = episodeData.endTime || "--:--";

//     const pauseTextDOM = document.createElement("p");
//     pauseTextDOM.textContent = "Pause";

//     const timeDOM = document.createElement("p");
//     timeDOM.textContent = startTime;

//     pauseDOM.appendChild(timeDOM);
//     pauseDOM.appendChild(pauseTextDOM);

//     return pauseDOM;
// };

// // Block header mainly contains the dots that represent the options that are checked
// const createBlockHeader = (blockData) => {
//     const blockHeader = document.createElement("li");
//     blockHeader.classList.add("block-header");

//     // The container holding the little dots that represent the options
//     const optionsContainer = document.createElement("div");

//     const optionsText = document.createElement("p");
//     optionsText.textContent = "Options";
//     optionsContainer.appendChild(optionsText);

//     // Make the little dots that represent the options
//     blockData.options.forEach((option) => {
//         const optionDOM = document.createElement("div");
//         optionDOM.classList.add("option");

//         if (option.checked) { optionDOM.classList.add("checked"); }

//         optionsContainer.appendChild(optionDOM);
//     });
//     blockHeader.appendChild(optionsContainer);

//     return blockHeader;
// };

// const makeEpisodeDOM = (episodeData) => {
//     const episodeDOM = document.createElement("li");

//     const timeDOM = document.createElement("p");
//     timeDOM.textContent = episodeData.startTime;
//     episodeDOM.appendChild(timeDOM);

//     const episodeFileNameDOM = document.createElement("p");
//     episodeFileNameDOM.textContent = episodeData.fileName;
//     episodeDOM.appendChild(episodeFileNameDOM);

//     return episodeDOM;
// };

const createProjectDOM = (projectData) => {

    const unixTimeToDate = (unixTime) => {
        if (!unixTime) { return undefined; };

        const date = new Date(unixTime);

        return date.toLocaleDateString("en", { year: "numeric", weekday: "short", month: "short", day: "numeric" })
    };

    const projectTemplate = `
        <div class="round-box load-project clickable" tabindex="0">
            <div class="project-header">
                <div class="project-date">
                    <p>Trekdag</p>
                    <h3>${projectData.date}</h3>
                </div>

                <div class="meta-data">
                    <p>Last modified: </p>
                    <p>${unixTimeToDate(projectData.dateModified)}</p>
                </div>

                <img class="clickable clickable-icon delete-project" tabindex="0" src="../../assets/images/delete_35dp_000000_FILL0_wght700_GRAD0_opsz40.png" alt="Delete">
            </div>

            <ul></ul>
        </div>`;

    const blockHeaderTemplate = (options) => {
        const dots = [];
        options.forEach(option => {
            dots.push(`<div class="option${option.checked ? " checked" : ""}"></div>`);
        });

        return `
        <li class="block-header">
            <p>Options</p>

            <div>
                ${dots.join("\n")}
            </div>
        </li>`
    };

    const episodeTemplate = (time, episodeName) => `
        <li>
            <p class="time">${time}</p>
            <p class="episode-name">${episodeName}</p>
        </li>`;


    const pauseTemplate = (time) => `
        <li class="pause">
            <p class="time">${time}</p>
            <p class="pause-text">Pause</p>
        </li>`;

    const temporaryWrapper = document.createElement("div");
    temporaryWrapper.innerHTML = projectTemplate;
    const projectDOM = temporaryWrapper.children[0];

    const episodeList = projectDOM.querySelector("ul");

    projectData.blocks.forEach((blockData) => {
        episodeList.innerHTML += blockHeaderTemplate(blockData.options);

        blockData.episodes.forEach((episodeData) => {
            episodeList.innerHTML += episodeTemplate(episodeData.startTime, episodeData.fileName);
        });

        episodeList.innerHTML += pauseTemplate(blockData.episodes.at(-1)?.endTime || blockData.startTime || "--:--");
        episodeList.innerHTML += `<hr>`;
    });

    // Clicking the project can: delete it, or open it in the editor depending on where you click
    projectDOM.addEventListener("click", (event) => {
        // If clicking the trash can and user confirms, delete the project
        if (
            event.target.classList.contains("delete-project")
            &&
            confirm("Are you sure you want to delete this project?")
        ) {
            // Tells the backend to delete the project
            projects.delete(project.id).then(() => {
                projectDOM.remove();
            });

            return;
        }

        // Else, go to the project in the editor
        window.location.href = `./playlist-editor.html?id=${projectData.id}`;
    });

    return projectDOM;
};
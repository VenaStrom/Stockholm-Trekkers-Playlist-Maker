"use strict";

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
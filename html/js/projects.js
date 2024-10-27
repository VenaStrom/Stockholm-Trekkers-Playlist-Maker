// Big plus button for making a new project
const createNewProjectButton = document.querySelector(".make-new-project");
createNewProjectButton.addEventListener("click", () => {
    window.location.href = "./project-editor.html?id=new";
});

// Decides how to format the time you see by "last modified" 
const formatTime = (unixTime) => {
    if (!unixTime) {
        return false;
    };

    const date = new Date(unixTime);

    return date.toLocaleDateString("en", { year: "numeric", weekday: "short", month: "short", day: "numeric" })
};

// Clone and clean up the template project
const cloneTemplateProject = () => {
    const templateProject = document.querySelector(".load-project-template.hidden");
    const projectDOM = templateProject.cloneNode(true);
    projectDOM.classList.remove("load-project-template");
    projectDOM.classList.add("load-project");
    projectDOM.classList.remove("hidden")

    const episodeDOMs = projectDOM.querySelector("ul");
    episodeDOMs.innerHTML = ""; // Wipe the template episodes

    return projectDOM;
};

// Creates and fills the metadata tag with the date modified
const makeMetadataDOM = (project, projectDOM) => {
    const metadataDOM = projectDOM.querySelector(".meta-data");
    metadataDOM.innerHTML = "";

    const modifiedAt = document.createElement("p");
    modifiedAt.textContent = "Last modified: ";
    const modifiedTime = document.createElement("p");
    modifiedTime.textContent = formatTime(project.dateModified);
    metadataDOM.appendChild(modifiedAt);
    metadataDOM.appendChild(modifiedTime);

    return metadataDOM;
}

const makeBlockHeader = (blockData) => {
    const blockHeaderDOM = document.createElement("li");
    blockHeaderDOM.classList.add("block-header");

    // The container holding the little dots that represent the options
    const optionsContainer = document.createElement("div");

    const optionsText = document.createElement("p");
    optionsText.textContent = "Options";
    optionsContainer.appendChild(optionsText);

    // Make the little dots that represent the options
    blockData.options.forEach((option) => {
        const optionDOM = document.createElement("div");
        optionDOM.classList.add("option");

        if (option.checked){
            optionDOM.classList.add("checked");
        }

        optionsContainer.appendChild(optionDOM);
    });
    blockHeaderDOM.appendChild(optionsContainer);

    return blockHeaderDOM;
};

const makeEpisodeDOM = (episodeData) => {
    const episodeDOM = document.createElement("li");

    const startTime = episodeData.startTime;
    const fileName = episodeData.fileName;

    const timeDOM = document.createElement("p");
    const episodeFileNameDOM = document.createElement("p");

    timeDOM.textContent = startTime;
    episodeFileNameDOM.textContent = fileName;

    episodeDOM.appendChild(timeDOM);
    episodeDOM.appendChild(episodeFileNameDOM);

    return episodeDOM;
};

const makePauseDOM = (episodeData) => {
    const pauseDOM = document.createElement("li");
    pauseDOM.classList.add("pause");

    const startTime = episodeData.endTime || "--:--";

    const timeDOM = document.createElement("p");
    const pauseTextDOM = document.createElement("p");

    timeDOM.textContent = startTime;
    pauseTextDOM.textContent = "Pause";

    pauseDOM.appendChild(timeDOM);
    pauseDOM.appendChild(pauseTextDOM);

    return pauseDOM;
};


// Populate the, "view old projects" screen
// The html structure this makes can be found in the load-project-template div found in the head tag of projects.html
projects.getAll().then((projectList) => {
    if (!projectList) {
        console.warn("No projects found.");
        return;
    }

    projectList.forEach(project => {
        const projectDOM = cloneTemplateProject();

        // Set the big text to the date of the trekdag
        projectDOM.querySelector(".project-header h3").textContent = project.date;

        // Set the metadata tag to show the date modified
        projectDOM.querySelector(".project-header>.meta-data").innerHTML = makeMetadataDOM(project, projectDOM).innerHTML;

        // Loop through all of the episodes in all the blocks and append them to the project
        const episodeList = projectDOM.querySelector("ul");
        project.blocks.forEach((blockData) => {

            // Add the block header
            episodeList.appendChild(makeBlockHeader(blockData));

            blockData.episodes.forEach((episodeData) => {
                episodeList.appendChild(makeEpisodeDOM(episodeData));
            });

            // Add a hairline between the pause and the episodes
            episodeList.appendChild(document.createElement("hr"));

            // Add the pause at the end of the block
            const lastEpisode = blockData.episodes.at(-1) || { endTime: "--:--" };
            episodeList.appendChild(makePauseDOM(lastEpisode));

            // Add a hairline after the pause and before the next block
            episodeList.appendChild(document.createElement("hr"));
        });

        // Place the project after the big plus button
        createNewProjectButton.insertAdjacentElement("afterend", projectDOM);

        // Clicking the project can: delete it, or open it in the editor
        projectDOM.addEventListener("click", (event) => {
            // If the delete button is clicked, delete the project
            if (event.target.classList.contains("delete-project")) {
                if (!confirm("Are you sure you want to delete this project?")) {
                    return;
                }

                // Tells the backend to delete the project
                projects.delete(project.id).then(() => {
                    projectDOM.remove();
                });
            } else {

                // Go to the project in the editor
                window.location.href = `./project-editor.html?id=${project.id}`;
            }
        });
    });
});


// Big plus button for making a new project
const createNewProjectButton = document.querySelector(".make-new-project");
createNewProjectButton.addEventListener("click", () => {
    window.location.href = "./playlist-editor.html?id=new";
});


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
const createMetadataDOM = (projectData) => {
    // Decides how to format the time you see by "last modified" 
    const unixTimeToDate = (unixTime) => {
        if (!unixTime) { return undefined; };

        const date = new Date(unixTime);

        return date.toLocaleDateString("en", { year: "numeric", weekday: "short", month: "short", day: "numeric" })
    };

    const metadataDOM = document.createElement("div");

    const lastModifiedText = document.createElement("p");
    lastModifiedText.textContent = "Last modified: ";

    const lastModifiedTime = document.createElement("p");
    lastModifiedTime.textContent = unixTimeToDate(projectData.dateModified);

    metadataDOM.appendChild(lastModifiedText);
    metadataDOM.appendChild(lastModifiedTime);

    return metadataDOM;
};

const createPauseDOM = (episodeData) => {
    const pauseDOM = document.createElement("li");
    pauseDOM.classList.add("pause");

    const startTime = episodeData.endTime || "--:--";

    const pauseTextDOM = document.createElement("p");
    pauseTextDOM.textContent = "Pause";

    const timeDOM = document.createElement("p");
    timeDOM.textContent = startTime;

    pauseDOM.appendChild(timeDOM);
    pauseDOM.appendChild(pauseTextDOM);

    return pauseDOM;
};

// Block header mainly contains the dots that represent the options that are checked
const createBlockHeader = (blockData) => {
    const blockHeader = document.createElement("li");
    blockHeader.classList.add("block-header");

    // The container holding the little dots that represent the options
    const optionsContainer = document.createElement("div");

    const optionsText = document.createElement("p");
    optionsText.textContent = "Options";
    optionsContainer.appendChild(optionsText);

    // Make the little dots that represent the options
    blockData.options.forEach((option) => {
        const optionDOM = document.createElement("div");
        optionDOM.classList.add("option");

        if (option.checked) { optionDOM.classList.add("checked"); }

        optionsContainer.appendChild(optionDOM);
    });
    blockHeader.appendChild(optionsContainer);

    return blockHeader;
};

const makeEpisodeDOM = (episodeData) => {
    const episodeDOM = document.createElement("li");

    const timeDOM = document.createElement("p");
    timeDOM.textContent = episodeData.startTime;
    episodeDOM.appendChild(timeDOM);

    const episodeFileNameDOM = document.createElement("p");
    episodeFileNameDOM.textContent = episodeData.fileName;
    episodeDOM.appendChild(episodeFileNameDOM);

    return episodeDOM;
};

const createProjectDOM = (projectData) => {
    const projectDOM = cloneTemplateProject();

    const projectHeader = projectDOM.querySelector(".project-header");

    // The date of the trekdag
    projectHeader.querySelector("h3").textContent = projectData.date;

    // Metadata in the header
    projectHeader.querySelector(".meta-data").outerHTML = createMetadataDOM(projectData);

    // Loop through all the blocks and episodes and append them to the project
    projectData.blocks.forEach((blockData) => {
        const episodeList = document.createElement("ul");

        episodeList.appendChild(createBlockHeader(blockData));

        blockData.episodes.forEach((episodeData) => {
            episodeList.appendChild(makeEpisodeDOM(episodeData));
        });

        // Add a hairline between the pause and the episodes
        episodeList.appendChild(document.createElement("hr"));

        // Add the pause at the end of the block with the time of the last episodes end time
        const lastEpisodeData = blockData.episodes.at(-1) || { endTime: "--:--" };
        if (blockData.length === 0) {
            // If there are no episodes, the pause should just say the start time of the block
            lastEpisodeData.endTime = blockData.startTime || "--:--";
        }
        episodeList.appendChild(createPauseDOM(lastEpisodeData));

        episodeList.appendChild(document.createElement("hr"));
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
        window.location.href = `./playlist-editor.html?id=${project.id}`;
    });
};
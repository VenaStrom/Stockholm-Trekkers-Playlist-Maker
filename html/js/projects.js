const createNewProjectButton = document.querySelector(".make-new-project");

createNewProjectButton.addEventListener("click", () => {
    window.location.href = "./project-editor.html?id=new";
});


const templateProject = document.querySelector(".load-project-template.hidden");

// Populate the, "view old projects" screen
projects.getAll().then((projects) => {
    if (!projects) {
        console.warn("No projects found.");
        return;
    }

    projects.forEach(project => {
        const projectDOM = templateProject.cloneNode(true);
        projectDOM.classList.remove("load-project-template");
        projectDOM.classList.add("load-project");
        projectDOM.classList.remove("hidden")

        // Set the name i.e. the date of the trekdag
        projectDOM.querySelector(".project-header h3").textContent = project.name

        // The metadata tag shows date created and date modified 
        const metaDataDOM = projectDOM.querySelector(".meta-data");

        const formatTime = (unixTime) => {
            if (!unixTime) {
                return false;
            };

            const date = new Date(unixTime);
            const hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, "0");

            return `${date.toDateString()} ${hours}:${minutes}`;
        };

        // Set the date modified
        metaDataDOM.querySelector("p").textContent = formatTime(project.dateModified);

        // Loop through all of the episodes in the blocks and add them to the "load project DOM"
        const episodesDOM = projectDOM.querySelector("ul");
        episodesDOM.innerHTML = "";

        project.blocks.forEach((block, index) => {

            block.episodes.forEach((episode, index) => {
                const episodeDOM = document.createElement("li");

                const startTime = episode.startTime;
                const fileName = episode.fileName;

                const timeDOM = document.createElement("p");
                const fileDOM = document.createElement("p");
                timeDOM.textContent = startTime;
                fileDOM.textContent = fileName;
                episodeDOM.appendChild(timeDOM);
                episodeDOM.appendChild(document.createTextNode("-"));
                episodeDOM.appendChild(fileDOM);

                episodesDOM.appendChild(episodeDOM);

                if (index === 0) {
                    timeDOM.textContent = block.startTime;
                }
            });

            if (index !== project.blocks.length - 1) {
                const hairline = document.createElement("li");
                hairline.classList.add("block-divider");
                episodesDOM.appendChild(hairline);
            }
        });

        // Go to the project in the editor when clicked
        projectDOM.addEventListener("click", () => {
            window.location.href = `./project-editor.html?id=${project.id}`;
        });

        createNewProjectButton.insertAdjacentElement("afterend", projectDOM);
    });
});

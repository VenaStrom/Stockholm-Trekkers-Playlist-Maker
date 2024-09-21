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
            const [yyyymmdd, fullTime] = date.toISOString().split("T");
            const time = fullTime.slice(0, 5);

            return `${yyyymmdd} ${time}`;
        };

        // If it has a date modified and not a date created then the modified date is the creation date
        if (project.dateCreated) {
            metaDataDOM.querySelector("p:nth-child(2)").textContent = formatTime(project.dateCreated);
            metaDataDOM.querySelector("p:nth-child(4)").textContent = formatTime(project.dateModified);
        } else if (project.dateModified) {
            metaDataDOM.querySelector("p:nth-child(2)").textContent = formatTime(project.dateModified);
            metaDataDOM.querySelector("p:nth-child(3)").innerHTML = "";
            metaDataDOM.querySelector("p:nth-child(4)").innerHTML = "";
        } else {
            metaDataDOM.innerHTML = "";
        }

        // Loop through all of the episodes in the blocks and add them to the "load project DOM"
        const episodesDOM = projectDOM.querySelector("ul");
        episodesDOM.innerHTML = "";

        project.blocks.forEach((block, index) => {

            block.episodes.forEach((episode) => {
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

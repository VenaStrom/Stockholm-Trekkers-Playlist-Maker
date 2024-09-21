const createNewProjectWindow = document.getElementById("add-projects-after");

createNewProjectWindow.addEventListener("click", () => {
    window.location.href = "./project-editor.html?id=new";
});


const templateProject = document.querySelector("div.round-box.load-project-template.hidden")

// Populate the, "view old projects" screen
projects.getAll().then((projects) => {
    if (!projects) {
        console.warn("No projects found.");
        return;
    }

    projects.forEach(project => {
        const projectDOM = templateProject.cloneNode();
        projectDOM.classList.remove("load-project-template");
        projectDOM.classList.add("load-project");
        projectDOM.classList.remove("hidden")

        // Set the name i.e. the date of the trekdag
        projectDOM.querySelector(".project-header h3").textContent = project.name

        // The metadata tag shows date created and date modified 
        const metaDataDOM = projectDOM.querySelector(".meta-data");
        metaDataDOM.innerHTML = "";

        const dateCreatedDOM = document.createElement("p");
        const dateModifiedDOM = document.createElement("p");

        // If the project only has a dateModified means it has never been modified and a set dateCreated means it has been edited
        if (project.dateCreated) {
            dateCreatedDOM.textContent = project.dateCreated;
            dateModifiedDOM.textContent = project.dateModified;

            metaDataDOM.appendChild(dateModifiedDOM);

        } else {
            dateCreatedDOM.textContent = project.dateModified;
        }

        metaDataDOM.appendChild(dateCreatedDOM);

        const episodesDOM = projectDOM.querySelector("ul");

        project.blocks.forEach((block) => {
            block.episodes.forEach((episode) => {
                const episodeDOM = document.createElement("li");
                const startTime = new Date(episode.startTime).toISOString();
                episodeDOM.textContent = `${}`;
                episodesDOM.appendChild(episodeDOM);
            });
        });
    });
});

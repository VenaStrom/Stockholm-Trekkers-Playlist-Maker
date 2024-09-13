const createNewProjectWindow = document.getElementById("add-projects-after");


createNewProjectWindow.addEventListener("click", () => {
    window.location.href = "./project-editor.html?id=new";
});


projects.getAll().then((projects) => {
    if (!projects) {
        console.warn("No projects found.");
        return;
    }

    projects.forEach((project) => {

        const loadProjectBox = `
            <div class="round-box load-project" tabindex="0">
                <div class="project-header">
                    <div class="project-name">
                        <p>Trekdag</p>
                        <h3>${project.name}</h3>
                    </div>

                    <div class="meta-data">
                        <p>Created:</p>
                        <p>${project.creationDate}</p>
                        <p>Modified:</p>
                        <p>${project.lastModified}</p>
                    </div>
                </div>

                <ul>
                    ${project.files.map((file) => `<li>${file.startTime} - ${file.name}</li>`).join("")}
                </ul>
            </div>`;

        createNewProjectWindow.insertAdjacentHTML("afterend", loadProjectBox);
    });
});

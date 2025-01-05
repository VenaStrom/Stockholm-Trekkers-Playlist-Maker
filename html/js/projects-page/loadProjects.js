"use strict";

// Clicking the "New Project" will redirect to the editor with the id "new" so the id generator will know to make a new one
const createNewProjectButton = document.querySelector(".make-new-project");
createNewProjectButton.addEventListener("click", () => {
    window.location.href = "./playlist-editor.html?id=new";
});

// Projects gives the list of all projects in the save folder app/user-data/save-files
projects.getAll().then((projectList) => {
    projectList.forEach((projectData) => {
        createNewProjectButton.insertAdjacentElement("afterend", createProjectDOM(projectData));
    });
});
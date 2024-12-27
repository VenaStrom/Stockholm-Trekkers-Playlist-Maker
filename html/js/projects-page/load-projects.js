"use strict";

// Big plus button for making a new project
const createNewProjectButton = document.querySelector(".make-new-project");
createNewProjectButton.addEventListener("click", () => {
    window.location.href = "./playlist-editor.html?id=new";
});

// Projects gives the list of all projects in the save folder app/user-data/projects
// projects.getAll().then((projectList) => {
//     projectList.forEach((projectData) => {
//         createNewProjectButton.insertAdjacentElement("afterend", createProjectDOM(projectData));
//     });
// });
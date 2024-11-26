
// Projects gives the list of all projects in the save folder app/user-data/projects
projects.getAll().then((projectList) => {
    projectList.forEach((projectData) => {
        createProjectDOM(projectData);
    });
});
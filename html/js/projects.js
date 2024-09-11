
projects.getAll().then((projects) => {
    if (!projects) { 
        console.warn("No projects found.");
        return;
    }
});
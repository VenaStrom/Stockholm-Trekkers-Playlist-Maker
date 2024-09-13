const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("node:path");


const setUpHandlers = () => {
    ipcMain.handle("get-projects", async () => {
        const projects = [];
        
        const projectFolder = path.join(__dirname, "../../user-data/projects/");
        
        if (!fs.existsSync(projectFolder)) {
            fs.mkdirSync(projectFolder, { recursive: true });
            
            return false;
        };
        
        // Loop through all files in the project folder
        fs.readdirSync(projectFolder).forEach((file) => {
            // Check if the file is a folder
            if (fs.lstatSync(path.join(projectFolder, file)).isDirectory()) { return };
            
            // Read the project file
            const project = JSON.parse(fs.readFileSync(path.join(projectFolder, file), "utf-8"));
            
            projects.push(project);
        });
        
        console.log(projects);
        
        return projects;
    });
};

module.exports = { setUpHandlers };
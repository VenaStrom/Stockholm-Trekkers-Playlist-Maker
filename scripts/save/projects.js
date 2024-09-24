const { ipcMain } = require("electron");
const fs = require("node:fs");
const path = require("node:path")
const raiseError = require("../raiseError.js");

const projectGet = (id, projectDirPath) => {
    const filePath = path.join(projectDirPath, id + ".json")

    if (!fs.existsSync(filePath)) {
        return undefined;
    }

    const data = JSON.parse(fs.readFileSync(filePath));

    if (data){
        return data;
    } else {
        raiseError("Error reading project file: " + filePath);
        return undefined;
    }
};

const projectSave = (projectData, projectDirPath) => {
    console.log("[INFO] Saving project: " + projectData.name + " - " + projectData.id);
    const id = projectData.id;
    const filePath = path.join(projectDirPath, projectData.id + ".json");

    if (!id) {
        raiseError("No ID provided for the project save");
        return undefined;
    }

    // If the save already exists, get it's creation date
    if (fs.existsSync(filePath)) {
        const oldFile = JSON.parse(fs.readFileSync(filePath))

        // To get the date created, just look for the old data
        projectData.dateCreated = oldFile.dateModified;
    } 

    fs.writeFileSync(filePath, JSON.stringify(projectData), { flag: "w" });

    return "Project saved";
};

const projectDelete = (id, projectDirPath) => {
    const filePath = path.join(projectDirPath, id + ".json")

    if (fs.existsSync(filePath)) {
        fs.rmSync(filePath);
        return "Project deleted";
    }

    return undefined;
};

const projectGetAll = (projectDirPath) => {
    const projectFiles = fs.readdirSync(projectDirPath);

    return projectFiles.map((file) => {
        return JSON.parse(fs.readFileSync(path.join(projectDirPath, file), {encoding: "utf-8"}));
    });
};

const setUpHandlers = () => {
    // Make sure the projects folder exists
    const projectFolder = path.join(__dirname, "../..", "user-data", "projects");
    if (!fs.existsSync(projectFolder)) {
        fs.mkdirSync(projectFolder, { recursive: true });
    };

    ipcMain.handle("project-get", (event, id) => {
        return projectGet(id, projectFolder);
    });
    ipcMain.handle("project-save", (event, projectJSON) => {
        return projectSave(projectJSON, projectFolder);
    });
    ipcMain.handle("project-delete", (event, id) => {
        return projectDelete(id, projectFolder);
    });
    ipcMain.handle("project-get-all", (event) => {
        return projectGetAll(projectFolder);
    });
};

module.exports = { setUpHandlers };
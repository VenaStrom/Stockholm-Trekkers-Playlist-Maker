"use strict";
require("../extend/console.js"); // Adds more verbose logging to the console and colors!

const { ipcMain } = require("electron");
const fs = require("node:fs");
const path = require("node:path")
const { saveFilesPath } = require("../../main.js");

const projectGet = (id) => {
    const filePath = path.join(saveFilesPath, id + ".json")

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const data = JSON.parse(fs.readFileSync(filePath));

    if (data) {
        return data;
    } else {
        console.error("Error reading project file: " + filePath);
        return null;
    }
};

const projectSave = (projectData) => {
    console.info("Saving project: " + projectData.date + " - " + projectData.id);
    const id = projectData.id;
    const filePath = path.join(saveFilesPath, projectData.id + ".json");

    if (!id) {
        console.error("No ID provided for the project save");
        return null;
    }

    fs.writeFileSync(filePath, JSON.stringify(projectData), { flag: "w" });

    return "Project saved";
};

const projectDelete = (id) => {
    const filePath = path.join(saveFilesPath, id + ".json")

    if (fs.existsSync(filePath)) {
        fs.rmSync(filePath);
        return "Project deleted";
    }

    return null;
};

const projectGetAll = () => {
    const projectFiles = fs.readdirSync(saveFilesPath);

    return projectFiles.map((file) => {
        return JSON.parse(fs.readFileSync(path.join(saveFilesPath, file), { encoding: "utf-8" }));
    });
};

const ipcHandlers = () => {
    ipcMain.handle("project-get", (_, id) => {
        return projectGet(id);
    });
    ipcMain.handle("project-save", (_, projectJSON) => {
        return projectSave(projectJSON);
    });
    ipcMain.handle("project-delete", (_, id) => {
        return projectDelete(id);
    });
    ipcMain.handle("project-get-all", (_) => {
        return projectGetAll();
    });
};

module.exports = { ipcHandlers, projectGet, projectSave, projectDelete, projectGetAll };
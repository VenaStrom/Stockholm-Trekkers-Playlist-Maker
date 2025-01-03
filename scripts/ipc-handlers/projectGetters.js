"use strict";

const { ipcMain } = require("electron");
const fs = require("node:fs");
const path = require("node:path")
const { userDataFolder, saveFilesFolder, videoAssetsFolder, downloadReferenceFile } = require("../../filePaths.js");


const projectGet = (id) => {
    console.info(`Getting project\n ID: ${id}`);

    if (!id) {
        console.error("No ID provided for the project get");
        return null;
    }

    const filePath = path.join(saveFilesFolder, `${id}.json`)

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const data = JSON.parse(fs.readFileSync(filePath));

    if (data) {
        return data;
    } else {
        console.error(`Error reading project file (${filePath || "no file path"})`);
        return null;
    }
};

const projectSave = (projectData) => {
    console.info(`Saving project\n ID: ${projectData.date}\n date: ${projectData.id}`);

    if (!projectData) {
        console.error("No project data provided for the project save");
        return null;
    }

    const id = projectData.id;
    if (!id) {
        console.error("No ID provided for the project save");
        return null;
    }

    const filePath = path.join(saveFilesFolder, `${id}.json`);

    fs.writeFileSync(filePath, JSON.stringify(projectData), { flag: "w" });

    return "Project saved";
};

const projectDelete = (id) => {
    console.info(`Deleting project\n ID: ${id}`);

    if (!id) {
        console.error("No ID provided for the project delete");
        return null;
    }

    const filePath = path.join(saveFilesFolder, `${id}.json`)

    if (fs.existsSync(filePath)) {
        fs.rmSync(filePath);
        return "Project deleted";
    }

    return null;
};

const projectGetAll = () => {
    console.info("Getting all projects");

    const projectFiles = fs.readdirSync(saveFilesFolder);

    return projectFiles.map((file) => {
        return JSON.parse(fs.readFileSync(path.join(saveFilesFolder, file), { encoding: "utf-8" }));
    });
};

const ipcHandlers = () => {
    ipcMain.handle("project-get", (_, id) => {
        return projectGet(id);
    });
    ipcMain.handle("project-save", (_, projectData) => {
        return projectSave(projectData);
    });
    ipcMain.handle("project-delete", (_, id) => {
        return projectDelete(id);
    });
    ipcMain.handle("project-get-all", (_) => {
        return projectGetAll();
    });
    ipcMain.handle("get-projects-path", (_) => {
        return saveFilesFolder;
    });
};

module.exports = { ipcHandlers, projectGet, projectSave, projectDelete, projectGetAll };
const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("node:path")
const raiseError = require("../raiseError.js");

const userDataPath = path.join(__dirname, "../../userData");
console.log(userDataPath);

const getUserData = (key) => {

};

const setUserData = (key, value) => {

};

const removeUserData = (key) => {

};

const setUpHandlers = () => {
    ipcMain.handle("get-user-data", (event, key) => { });
};

module.exports = { setUpHandlers };
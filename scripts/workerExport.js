const { parentPort } = require("worker_threads");
// const { copyAllAssets } = require("./export.js");

parentPort.on("message", (message) => {
    console.log("[INFO] Worker started working");
    console.log(message);
    // copyAllAssets(message.projectJSON, message.projectFolder);
});

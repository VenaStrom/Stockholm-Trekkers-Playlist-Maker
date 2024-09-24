const path = require("node:path");
const fs = require("node:fs");
const { execFile } = require("node:child_process");
const ffprobe = require("ffprobe-static").path;
const raiseError = require("./raiseError.js");


// Function to extract metadata using ffprobe
getVideoMetadata = (filePath) => {
    return new Promise((resolve, reject) => {
        execFile(ffprobe, [
            "-v", "error",
            "-show_format",
            "-show_streams",
            "-print_format", "json",
            filePath
        ], (error, stdout, stderr) => {
            if (error) {
                reject(`Error running ffprobe: ${stderr}`);
            } else {
                resolve(JSON.parse(stdout));
            }
        });
    });
}

// Usage example:
const videoFilePath = "C:/Users/viggo/Documents/GitHub/Stockholm-Trekkers-Playlist-Maker/assets/videos/pause_1_min_covid.mp4";  // Your video file path

getVideoMetadata(videoFilePath)
    .then(metadata => {
        console.log("Video Metadata:", metadata);
        fs.writeFileSync("C:/Users/viggo/Documents/GitHub/Stockholm-Trekkers-Playlist-Maker/metadata.json", JSON.stringify(metadata));
    })
    .catch(err => {
        console.error("Error fetching metadata:", err);
    });

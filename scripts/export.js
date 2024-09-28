const { ipcMain, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const raiseError = require("./raiseError.js");
const { projectGet, projectFolder: userData, projectFolder } = require("./save/projects.js");

const copyAllAssets = (projectJSON, projectFolder) => {
    // Creates the project folder in the selected folder.
    // Confirm with the user to overwrite old folder, if not, cancel the export
    if (fs.existsSync(projectFolder)) {
        if (
            !dialog.showMessageBoxSync({
                type: "question",
                buttons: ["Yes", "No"],
                title: "Export",
                message: "The project folder already exists. Do you want to overwrite it? \n\n Clicking no will cancel the export.",
                defaultId: 1,
                cancelId: 1,
            })
        ) {
            return;
        }
        // If the user wants to overwrite the folder, delete the old folder
        fs.rmSync(projectFolder, { recursive: true });
    }

    // Create the output folder
    fs.mkdirSync(projectFolder);

    // Copies the pause clips to the output folder
    const pauseFolder = path.join(__dirname, "..", "assets", "videos");

    // Copy the entire pauses folder to the output folder in /pauses
    fs.mkdirSync(path.join(projectFolder, "pauses"));
    fs.cpSync(pauseFolder, path.join(projectFolder, "pauses"), { recursive: true });

    // Make episodes folder
    fs.mkdirSync(path.join(projectFolder, "episodes"));

    // Loop through all the episodes and copy them from their given path to the output folder
    projectJSON.blocks.forEach((block) => {
        block.episodes.forEach((episode) => {

            // Check if the file path is missing or if the file is missing
            if (episode.filePath === "") { raiseError("Cannot find " + episode.fileName + ". The file path seems to be missing"); return; };
            if (!fs.existsSync(episode.filePath)) { raiseError("Cannot find " + episode.fileName + ". The file seems to be missing"); return; };

            // If a file with the same name already exists in the output folder, don't copy again
            if (fs.existsSync(path.join(projectFolder, "episodes", episode.fileName))) {
                console.log(`[INFO] A file (${episode.fileName}) wasn't copied due to the project already containing a file with the same name. This should be expected behavior when showing multiples of the same file but it could also be bad if files accidentally were named the same thing.`);
                return;
            };

            // Copy the episode to the output folder
            fs.copyFileSync(episode.filePath, path.join(projectFolder, "episodes", episode.fileName));
        });
    });
};

// Make the ps1 "harness" that runs VLC and runs the correct episodes at the correct times
const makePS1 = (projectJSON, projectFolder) => {
    const vlcPath = `$VLCpath = 'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe'`;
    const mainArgs = `
$mainArgs = @(
    '--one-instance',
    '--fullscreen',

    '--sub-language=swe,eng,any',

    '--deinterlace=0',
    '--embedded-video',
    '--no-loop',
    '--no-play-and-pause',
    '--no-random',
    '--no-repeat',
    '--no-video-title-show',

    '--qt-auto-raise=0',
    '--qt-continue=0',
    '--qt-fullscreen-screennumber=1',
    '--qt-notification=0',
    '--no-qt-fs-controller',
    '--no-qt-name-in-title',
    '--no-qt-recentplay',
    '--no-qt-updates-notif'
)`;

    const waitFuncDeclaration = `
# Example usage:
# Wait-UntilTime -Hour 10 -Minute 9
function Wait-UntilTime {
    param (
        [int]$Hour,
        [int]$Minute
    )

    $desiredTime = (Get-Date).Date.AddHours($Hour).AddMinutes($Minute)
    while ((Get-Date) -lt $desiredTime) {
        Start-Sleep -Seconds 1
    }
}`;

    const playVideoFuncDeclaration = `
# Example usage:
# Play-Video('C:\\path\\to\\episode.mkv') || Play-Video('C:\\path\\to\\episode.mkv', $true)
function Play-Video($videoPath, $enqueue = $false) {
    if ($enqueue) {
        $copyOfMainArgs = $mainArgs.Clone()
        $copyOfMainArgs += '--playlist-enqueue'

        & $vlcPath $videoPath $copyOfMainArgs
    } else {

        & $vlcPath $videoPath $mainArgs
    }

    # There's a small timeout to give VLC some time to start or queue things
    Start-Sleep -Milliseconds 100
}`;

    const insertPauseFuncDeclaration = `
# Example usage:
# Insert-Pause('C:\\pauses\\pause_30_min.mp4')
function Insert-Pause($pausePath) {
    Play-Video $pausePath
}`;

    const playLeadingClipFuncDeclaration = `
# Example usage:
# Insert-LeadingClip('C:\\pauses\\pause_1_min_countdown.mp4')
function Insert-LeadingClip($clipPath) {
    Play-Video $clipPath
}`;

    const initialMessage = `
# Inform the user that the playlist has started
Write-Host 'Playlist has started. You can leave the computer unattended now :)'
`;

    const waitUntil = (hour, minute) => {
        return `Wait-UntilTime -Hour ${hour} -Minute ${minute}`;
    };

    const playEpisode = (path, enqueue = false) => {
        return `Play-Video('${path}, ${enqueue}')`;
    };

    const insertPause = (path, enqueue = false) => {
        return `Insert-Pause('${path}, ${enqueue}')`;
    };

    const insertLeadingClip = (path, enqueue = false) => {
        return `Insert-LeadingClip('${path}, ${enqueue}')`;
    };

    const staticParts = [
        vlcPath,
        mainArgs,
        waitFuncDeclaration,
        playVideoFuncDeclaration,
        insertPauseFuncDeclaration,
        playLeadingClipFuncDeclaration,
        initialMessage,
    ];

    const blocksParts = [];

    // Each block will set the start time of the block minus eventual leading clips length since they will be played together
    // The first leading clip will play when called on while the rest of the clips and episodes will be queued
    projectJSON.blocks.forEach((block, index) => {
        const blockParts = [];

        blockParts.push(`#\n# Block ${index + 1} starts here\n#`);

        let [hour, minute] = block.startTime.split(":");

        // Every option that is checked will queue it's clip and move the start time forward
        block.options.forEach((option) => {
            if (option.checked) {
                const clipPath = "//pauses//" + option.fileName;
                blockParts.push(insertLeadingClip(clipPath));

                minute -= option.duration;

                // Handle rollover
                if (minute < 0) {
                    minute += 60;
                    hour -= 1;
                }
            }
        });
    });
};

// The main export function that is called when the user wants to export a project
const projectExport = (id) => {

    // Prompt with information about the export
    dialog.showMessageBoxSync({
        type: "info",
        buttons: ["OK"],
        title: "Good to know about exporting",
        message: "When exporting a project, your speed is limited only the the write speed of the disk you are exporting to. My suggestion is to export to your system drive for fast speeds. Then you should zip it and upload it to the cloud and copy it to a USB drive. This, in my experience, is the best and most convenient way of doing it since the program can hang if your writing directly to a USB drive.",
    });

    // Prompt to select the output folder
    const chosenFolder = dialog.showOpenDialogSync({
        properties: ["openDirectory"],
        buttonLabel: "Export here",
        title: "Select where the project folder will be exported",
        message: "Select where the project folder will be exported",
    });

    // If the user cancels the export, return
    if (!chosenFolder) { return; };

    // Get JSON object of the project
    const projectJSON = projectGet(id, userData);

    // The project folder is the folder within the chosen output folder that holds the actual project
    // chosen/projectName
    const projectFolder = path.join(chosenFolder[0], projectJSON.name);

    // Copy the pauses and episodes to the project folder
    copyAllAssets(projectJSON, projectFolder);

    // Make the ps1 script
};

const setUpHandlers = () => {
    ipcMain.handle("start-export", (event, id) => {
        projectExport(id);
    });
};

module.exports = { setUpHandlers };
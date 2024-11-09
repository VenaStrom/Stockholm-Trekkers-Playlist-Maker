
// For now, auto saving is flat out disabled. You will have to save manually
const autoSave = false;


// Return the entire project as a JSON object
const getJSONstruct = () => {
    const date = document.querySelector(".date-input input[type='text']").value;

    // Get all the DOM objects of the blocks that are not hidden
    const blocks = document.querySelectorAll(".block:not(.hidden)");

    const struct = {
        date: date,
        id: getID(),
        dateModified: new Date().getTime(),
        blocks: [],
    };

    // Loop through all the blocks and get the options and episodes and append them to the struct
    blocks.forEach((block) => {

        // Get the options of the block and set them in the struct
        const options = [];
        block.querySelectorAll(".options input[type='checkbox']").forEach(optionDOM => {
            options.push({
                id: optionDOM.id,
                checked: optionDOM.checked,
                duration: optionDOM.dataset.lengthSeconds,
                fileName: optionDOM.dataset.fileName,
            });
        });

        // Loop through and export all the episodes as a list
        const episodes = Array.from(block.querySelectorAll(".episode:not(.hidden)")) // only grab non-hidden episodes
            .filter((episode) => { 
                // ignore the file inputs that are empty
                const fileInput = episode.querySelector("input[type='file']");
                if (fileInput.value !== "") { return true; };

            }).map((episode) => {
                const fileInput = episode.querySelector("input[type='file']");
                return {
                    filePath: fileInput.getAttribute("data-file-path"),
                    fileName: fileInput.value.split(/[/\\]/).at(-1), // a somewhat hacky way to get the file name from the path
                    startTime: episode.querySelector(".time p").textContent,
                    endTime: episode.querySelector(".time p").dataset.endTime,
                    duration: episode.querySelector(".time p").dataset.duration,
                };
            });

        struct.blocks.push({
            startTime: block.querySelector(".header .time input[type='text']").value,
            options: options,
            episodes: episodes
        });
    });

    return struct;
};

const saveStatusText = document.querySelector("header #save-status");

const saveProject = () => {
    const struct = getJSONstruct();

    projects.save(struct).then((response) => {
        console.log("response after save: " + response);
        saveStatusText.textContent = "Saved";
    });
};


// Actions leading to saving //

// Save on the export button and start the export
const exportButton = document.querySelector("button.export");
exportButton.addEventListener("click", () => {
    saveProject();

    setTimeout(() => {
        // Calls the exporter api in the preload.js script
        exporter.start(getID());

        // Starts updating the export status text and progress bar
        startExportStatusGetter();
    }, 500);
});

// Ctrl + S to save
document.addEventListener("keydown", (event) => {
    if (!(event.ctrlKey && event.key === "s")) { return };

    event.preventDefault();
    saveProject();
});

// Save project on change if autoSave is enabled
document.addEventListener("change", () => {
    saveStatusText.textContent = "Latest changes not saved*";

    if (autoSave) {
        saveProject();
    }
});

// Save on clicking the save status text
saveStatusText.addEventListener("click", () => {
    saveProject();
});

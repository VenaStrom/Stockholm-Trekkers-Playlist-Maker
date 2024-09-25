
const autoSave = false;

const getJSONstruct = () => {
    const name = document.querySelector(".name-input input[type='text']").value;

    const blocks = document.querySelectorAll(".block:not(.hidden)");

    const struct = {
        name: name,
        id: getID(),
        dateModified: new Date().getTime(),
        blocks: [],
    };


    blocks.forEach((block) => {
        // Get the options and set them in the struct
        const options = {};
        block.querySelectorAll(".options input[type='checkbox']").forEach(optionDOM => {
            options[optionDOM.id] = optionDOM.checked;
        });

        // Loop through and export all the episodes as a list
        const episodes = Array.from(block.querySelectorAll(".episode:not(.hidden)")) // only grab non-hidden episodes
            .filter((episode) => {
                const fileInput = episode.querySelector("input[type='file']");
                if (fileInput.value !== "") {
                    return true;
                };
            }).map((episode) => {
                const fileInput = episode.querySelector("input[type='file']");
                return {
                    filePath: fileInput.getAttribute("data-file-path"),
                    fileName: fileInput.value.split("\\").at(-1),
                    startTime: episode.querySelector(".time p").textContent, // Should be a string HH:MM
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

// Save on the export button. It will have more functionality later
const exportButton = document.querySelector("button.export");
exportButton.addEventListener("click", () => {
    saveProject();
});

// Ctrl + S to save
document.addEventListener("keydown", (event) => {
    if (!(event.ctrlKey && event.key === "s")) { return };

    event.preventDefault();
    saveProject();
});

// Save project on change
document.addEventListener("change", () => {
    saveStatusText.textContent = "Latest changes not saved*";

    if (autoSave) {
        saveProject();
    }
});

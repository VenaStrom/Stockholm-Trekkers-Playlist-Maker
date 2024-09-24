
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
        });;

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
                    filePath: fileInput.value,
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

const saveProject = () => {
    const struct = getJSONstruct();

    projects.save(struct).then((response) => {
        console.log("response after save: " + response);
    });
};

// Save on the export button, it will have more functionality later
const exportButton = document.querySelector("button.export");
exportButton.addEventListener("click", async () => {
    // console.log(await projects.getAll());
    saveProject();
});

// Ctrl + S to save
document.addEventListener("keydown", (event) => {
    if (!(event.ctrlKey && event.key === "s")) { return };

    event.preventDefault();
    saveProject();
});


// Load project on page load if there is an ID
const id = getID();
if (id) {
    projects.get(id).then((project) => {
        console.log(project)
    });
    projects.get(id).then((project) => {
        if (!project) {
            console.warn("No project found with id: " + id);
            return;
        }

        document.querySelector(".name-input input[type='text']").value = project.name;

        project.blocks.forEach((block, blockIndex) => {
            const blockDOM = document.querySelectorAll(".block")[blockIndex];

            blockDOM.querySelector(".header .time input[type='text']").value = block.startTime;

            // Set the options
            Object.keys(block.options).forEach((option) => {
                blockDOM.querySelector(`.options input#${option}`).checked = block.options[option];
            });

            // Set the episodes
            block.episodes.forEach((episode, episodeIndex) => {
                const episodeDOM = blockDOM.querySelectorAll(".episode")[episodeIndex];

                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(new File([], episode.fileName));
                episodeDOM.querySelector(".file input[type='file']").files = dataTransfer.files;
                episodeDOM.querySelector(".file input[type='file']").dispatchEvent(new Event("change"));

                // episodeDOM.querySelector(".file input[type='file']").file = episode.filePath;
                episodeDOM.querySelector(".time p").textContent = episode.startTime;
            });
        });
    });
}

// Load project on page load if there is an ID
const id = getID();

if (id !== "new") {
    projects.get(id).then((project) => {
        if (!project) {
            console.warn("No project found with id: " + id);
            return;
        }

        document.querySelector(".name-input input[type='text']").value = project.name;

        project.blocks.forEach((block, blockIndex) => {
            // Create new blocks if there are not enough
            if (document.querySelectorAll(".block").length <= blockIndex) {
                createBlockDOM();
            }

            const blockDOM = document.querySelectorAll(".block")[blockIndex];

            blockDOM.querySelector(".header .time input[type='text']").value = block.startTime;

            // Set the options
            Object.keys(block.options).forEach((option) => {
                blockDOM.querySelector(`.options input#${option}`).checked = block.options[option];
            });

            // Set the episodes
            block.episodes.forEach((episode, episodeIndex) => {
                // Create new episode DOMs if there aren't enough
                if (blockDOM.querySelectorAll(".episode").length <= episodeIndex) {
                    createEpisodeDOM(blockDOM);
                };

                const episodeDOM = blockDOM.querySelectorAll(".episode")[episodeIndex];

                // This seems to be the only way of setting the file input (visually!!)
                const dataTransfer = new DataTransfer();
                const file = new File([new Blob()], episode.fileName);
                dataTransfer.items.add(file);

                const fileInput = episodeDOM.querySelector(".file input[type='file']");
                fileInput.files = dataTransfer.files;

                fileInput.setAttribute("data-file-path", episode.filePath);

                episodeDOM.querySelector(".time p").textContent = episode.startTime;
            });

            if (block.episodes.length !== 1) {
                createEpisodeDOM(blockDOM);
            };
            blockDOM.querySelector(".time input[type='text']").dispatchEvent(new Event("change"));
        });
    });
}
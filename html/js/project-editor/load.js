
// Load project on page load if there is an ID
const id = getID();

if (id !== "new") {
    projects.get(id).then((project) => {
        if (!project) {
            console.warn("No project found with id: " + id);
            return;
        }

        document.querySelector(".date-input input[type='text']").value = project.date;

        project.blocks.forEach((block, blockIndex) => {
            // Create new blocks if there are not enough
            if (document.querySelectorAll(".block").length <= blockIndex) {
                createBlockDOM();
            }

            const blockDOM = document.querySelectorAll(".block")[blockIndex];

            blockDOM.querySelector(".header .time input[type='text']").value = block.startTime;

            // Set the options
            block.options.forEach((option, optionIndex) => {
                const optionDOM = blockDOM.querySelector(".options input#" + option.id);
                if (optionDOM) {
                    optionDOM.checked = block.options[optionIndex].checked;
                }
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
                fileInput.dataset.filePath = episode.filePath;

                const timeDOM = episodeDOM.querySelector(".time p");

                timeDOM.textContent = episode.startTime;
                timeDOM.dataset.endTime = episode.endTime;
            });

            if (block.episodes.length !== 1) {
                createEpisodeDOM(blockDOM);
            };

            // Send events to update the times in the block. See createBlockAndEpisodes.js and setStartTimes.js
            blockDOM.querySelector(".time input[type='text']").dispatchEvent(new Event("blur"));
            blockDOM.dispatchEvent(new Event("change"));
        });
    });
}
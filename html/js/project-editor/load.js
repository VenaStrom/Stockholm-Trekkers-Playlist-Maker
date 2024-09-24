
// Load project on page load if there is an ID
const id = getID();
if (id) {
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
                console.log(episode.fileObj);
                episodeDOM.querySelector(".file input[type='file']").files = episode.fileObj;
                episodeDOM.querySelector(".file input[type='file']").dispatchEvent(new Event("change"));

                // episodeDOM.querySelector(".file input[type='file']").file = episode.filePath;
                episodeDOM.querySelector(".time p").textContent = episode.startTime;
            });
        });
    });
}

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

    
                // This seems to be the only way of setting the file input (visually!!)
                const dataTransfer = new DataTransfer();
                const file = new File([new Blob()], episode.fileName);
                dataTransfer.items.add(file);

                episodeDOM.querySelector(".file input[type='file']").files = dataTransfer.files;
                episodeDOM.querySelector(".file input[type='file']").dispatchEvent(new Event("change"));

                episodeDOM.querySelector(".time p").textContent = episode.startTime;
            });
        });
    });
}
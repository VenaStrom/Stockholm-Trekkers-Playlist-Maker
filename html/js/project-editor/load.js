
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

                // I don't like this solution but it seems to be the only way of setting the file input.
                // When actually exporting i think the path might need to be taken from the file input 
                // directly so you would have to go via the editor.
                const dataTransfer = new DataTransfer();
                const file = new File([episode.fileObj], episode.fileName, { type: episode.fileObj.type });
                dataTransfer.items.add(file);

                episodeDOM.querySelector(".file input[type='file']").files = dataTransfer.files;
                episodeDOM.querySelector(".file input[type='file']").dispatchEvent(new Event("change"));

                episodeDOM.querySelector(".time p").textContent = episode.startTime;
            });
        });
    });
}
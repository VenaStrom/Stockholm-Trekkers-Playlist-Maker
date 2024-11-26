
// The template episode lives in the <head> tag of the HTML
const templateEpisode = document.querySelector(".episode-template.hidden");

// Creates a new episode and add it to the given parent block
const createEpisodeDOM = (parent) => {
    // Clone the template and clean up its classes
    const episode = templateEpisode.cloneNode(true);
    episode.classList.add("episode");
    episode.classList.remove("episode-template");
    episode.classList.remove("hidden");

    // Hairline
    const hr = document.createElement("hr");

    parent.appendChild(episode);
    parent.appendChild(hr);

    // Make sure there's always at least one empty episode at the end of the block
    const fileInput = episode.querySelector("input[type='file']");
    fileInput.addEventListener("change", (event) => {
        const episodes = parent.querySelectorAll(".episode");

        // If the last episode DOM has a file, create a new episode since there should always be an empty episode at the end
        // This approach allows for gaps in the block which is useful for the user
        const lastEpisode = episodes[episodes.length - 1];
        if (lastEpisode.querySelector("input[type='file']").value) {
            createEpisodeDOM(parent);
        }

        // After the change, if a file was added, the file path is saved in the DOM
        if (event.target.value) {
            const file = event.target.files[0];
            const filePath = webUtils.getPathForFile(file);
            event.target.dataset.filePath = filePath;
        }
    });
};
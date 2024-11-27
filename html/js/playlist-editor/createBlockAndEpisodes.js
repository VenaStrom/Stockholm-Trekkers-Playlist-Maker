
// These templates are hidden in the HTML <head> tag
const templateEpisode = document.querySelector(".episode-template.hidden");
const templateBlock = document.querySelector(".block-template.hidden");

// The button with the big plus sign
const createBlockButton = document.querySelector(".create-block");

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

// Creates a block next to the create block button
const createBlockDOM = () => {
    // Clone the template and clean up its classes
    const block = templateBlock.cloneNode(true)
    block.classList.add("block");
    block.classList.remove("block-template");
    block.classList.remove("hidden");

    // Update the option dots 
    updateDots(block.querySelector(".options"));

    // Callback functions defined in setStartTimes.js and blockTimeValidator.js
    block.querySelector(".time input[type='text']").addEventListener("change", formatBlockTime);
    block.addEventListener("change", updateEpisodeTimesInBlock);
    block.querySelector(".time input[type='text']").addEventListener("blur", blockTimeValidator);

    // Make two episodes to start off with
    createEpisodeDOM(block);
    createEpisodeDOM(block);

    // Add this block to the DOM, before the create block button
    createBlockButton.insertAdjacentElement("beforebegin", block);

    // Focus on the blocks time input
    block.querySelector(".time input[type='text']").focus();
};

const deleteBlockDOM = (source) => {
    if (window.confirm("Are you sure you want to delete this block forever?")) {
        source.parentElement.parentElement.remove();
    };
};

// Start off with one block
createBlockDOM();

// Make new block when the "create new block" button is pressed
createBlockButton.addEventListener("click", createBlockDOM);

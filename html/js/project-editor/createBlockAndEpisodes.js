
const templateEpisode = document.querySelector(".episode-template.hidden");
const templateBlock = document.querySelector(".block-template.hidden");

const createBlockButton = document.querySelector(".create-block");

const createEpisodeDOM = (parent) => {
    // Clone the template and clean up the classes
    const episode = templateEpisode.cloneNode(true);
    episode.classList.add("episode");
    episode.classList.remove("episode-template");
    episode.classList.remove("hidden");

    parent.appendChild(episode);

    // If this input is the second to last one, make a new episode
    episode.querySelector("input[type='file']").addEventListener("change", (event) => {
        const episodes = parent.querySelectorAll(".episode");
        if (episodes[episodes.length - 1] === episode) {
            createEpisodeDOM(parent);
        }

        if (event.target.value) {
            const file = event.target.files[0];
            const filePath = webUtils.getPathForFile(file);
            event.target.setAttribute("data-file-path", filePath);
        }
    });
};

const setBlockNumbers = () => {
    const blocks = document.querySelectorAll(".blocks>.block");

    blocks.forEach((block, index) => {
        const blockNumber = block.querySelector("h3.block-number");
        blockNumber.textContent = "Block " + (index + 1);
    });
};

const createBlockDOM = () => {
    // Clone the template and clean up the classes
    const block = templateBlock.cloneNode(true)
    block.classList.add("block");
    block.classList.remove("block-template");
    block.classList.remove("hidden");

    block.querySelector(".time input[type='text']").addEventListener("change", updateTimes);

    // Make two episodes to start off with
    createEpisodeDOM(block);
    createEpisodeDOM(block);

    // Adds block to DOM
    createBlockButton.insertAdjacentElement("beforebegin", block);

    setBlockNumbers();
};

const deleteBlockDOM = (source) => {
    if (window.confirm("Are you sure you want to delete this block forever?")) {
        source.parentElement.parentElement.remove();
    };

    setBlockNumbers();
};

// Start off with one block
createBlockDOM();

// Make new block when the "create new block" button is pressed
createBlockButton.addEventListener("click", createBlockDOM);

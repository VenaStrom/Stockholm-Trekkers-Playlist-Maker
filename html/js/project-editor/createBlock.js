
const createBlockButton = document.querySelector(".create-block");
const templateBlock = document.querySelector(".block-template.hidden");

const createBlockDOM = () => {
    const block = templateBlock.cloneNode(true)
    block.classList.add("block");
    block.classList.remove("block-template");
    block.classList.remove("hidden");

    createBlockButton.insertAdjacentElement("beforebegin", block);

    // Make sure all the blocks have at least 2 episodes
    blocks.forEach(block => {
        if (block.querySelectorAll(".episode").length < 2) {
            createEpisodeDOM(block);
        };
    });
};

// Create a block to start off with
createBlockDOM(); 

// Hides blocks and episodes that are empty 
const hideUnset = () => {

    // Hide t he "make new block" button that has the big plus sign
    if (hideUnsetCheckbox.checked) {
        const createBlockButton = document.querySelector(".create-block");
        createBlockButton.classList.add("hidden");
    } else {
        const createBlockButton = document.querySelector(".create-block");
        createBlockButton.classList.remove("hidden");
    };

    // Hide all episodes that have no file attached
    const episodes = document.querySelectorAll(".episode");
    episodes.forEach(episode => {
        if (episode.querySelector("input[type='file']").value === "") {
            if (hideUnsetCheckbox.checked) {
                episode.classList.add("hidden");
            } else {
                episode.classList.remove("hidden");
            };
        };
    });

    // Hide blocks that have no visible episodes
    const blocks = document.querySelectorAll(".block");
    blocks.forEach(block => {
        if (block.querySelectorAll(".episode:not(.hidden)").length === 0) {
            block.classList.add("hidden");
        } else {
            block.classList.remove("hidden");
        };
    });
};

// There is a checkbox that toggles the hiding of unset blocks and episodes
const hideUnsetCheckbox = document.querySelector(".hide-unset>input[type='checkbox']");
hideUnsetCheckbox.addEventListener("change", hideUnset);
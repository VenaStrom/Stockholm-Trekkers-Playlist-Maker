
// The template block lives in the <head> tag of the HTML
const templateBlock = document.querySelector(".block-template.hidden");

// Creates a block next to the create block button
const createBlockDOM = (sibling) => {
    // Clone the template and clean up its classes
    const block = templateBlock.cloneNode(true)
    block.classList.add("block");
    block.classList.remove("block-template");
    block.classList.remove("hidden");

    // Update the option dots 
    updateDots(block.querySelector(".options"));

    // Callback functions defined in setStartTimes.js and timeValidator.js
    block.querySelector(".time input[type='text']").addEventListener("change", formatBlockTime);
    block.addEventListener("change", updateEpisodeTimesInBlock);
    block.querySelector(".time input[type='text']").addEventListener("blur", timeValidator);

    // Make two episodes to start off with
    createEpisodeDOM(block);
    createEpisodeDOM(block);

    // Add this block to the DOM, before the create block button
    sibling.insertAdjacentElement("beforebegin", block);

    // Focus on the blocks time input
    block.querySelector(".time input[type='text']").focus();
};

const deleteBlockDOM = (source) => {
    if (window.confirm("Are you sure you want to delete this block forever?")) {
        source.parentElement.parentElement.remove();
    };
};

const blocks = document.querySelectorAll(".blocks>.block");

blocks.forEach(block => {
    const episodes = block.querySelectorAll(".episode");

    if (episodes.length < 2) {
        // Cloning the previous one is not good. TODO
        block.appendChild(episodes[0].cloneNode(true));
    };
});

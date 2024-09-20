
const getJSONstruct = () => {
    const name = document.querySelector(".name-input input[type='text']").value;

    const blocks = document.querySelectorAll(".block:not(.hidden)");

    const struct = {
        name: name,
        id: getID(),
        blocks: [],
    };


    blocks.forEach((block) => {
        const options = {};
        block.querySelectorAll(".options input[type='checkbox']").forEach(optionDOM => {
            options[optionDOM.id] = optionDOM.checked;
        });;

        const episodes = Array.from(block.querySelectorAll(".episode:not(.hidden)"))
            .map((episode) => { // only grab non-hidden episodes
                return episode.querySelector(".file input[type='file']").value;

            }).filter((inputValue) => { // filter out empty strings
                if (inputValue !== "") {
                    return inputValue
                };
            });

        struct.blocks.push({
            startTime: block.querySelector(".header .time input[type='text']").value,
            options: options,
            episodes: episodes
        });
    });

    return struct;
};

const saveProject = () => {
    const struct = getJSONstruct();

    projects.save(struct).then((response) => {
        console.log("response after save: " + response);
    });
};


const exportButton = document.querySelector("button.export");
exportButton.addEventListener("click", async () => {
    console.log(await projects.getAll());
    // console.log(saveProject())
});



// Ctrl + S to save
document.addEventListener("keydown", (event) => {
    if (!(event.ctrlKey && event.key === "s")) { return };


});
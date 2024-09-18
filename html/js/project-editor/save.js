
const getJSONstruct = () => {
    const name = document.querySelector(".name-input input[type='text']").value;

    const blocks = document.querySelectorAll(".block:not(.hidden)");

    const struct = {
        name: name,
        id: getID(),
        blocks: [],
    };

    blocks.forEach((block) => {
        struct.blocks.push({

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
exportButton.addEventListener("click", () => {
    console.log(getJSONstruct())
});


document.addEventListener("keydown", (event) => {
    if (!(event.ctrlKey && event.key === "s")) { return };


});
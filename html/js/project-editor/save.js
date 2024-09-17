

const getJSONstruct = () => {
    const name = document.querySelector(".name-inout input[type='text']").value;

    const blocks = document.querySelectorAll(".block:not(.hidden)");

    const struct = {
        name: name,
        blocks: []
    };    

    blocks.forEach((block) => {
        struct.blocks.push({
            
        });
    });
};


const expandOptions = (source) => {
    const options = source.parentElement.querySelector(".options");
    const state = options.style.display;

    if (state === "flex") {
        source.textContent = "Options ▼";
        options.style.display = "none";
    } else {
        source.textContent = "Options ▲";
        options.style.display = "flex";
    };
};

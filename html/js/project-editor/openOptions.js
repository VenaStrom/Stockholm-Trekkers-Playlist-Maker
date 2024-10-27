
const expandOptions = (source) => {
    const options = source.parentElement.querySelector(".options");
    const state = options.style.display;

    if (state === "flex") {
        source.querySelector("p").textContent = "Options ▼";
        options.style.display = "none";
    } else {
        source.querySelector("p").textContent = "Options ▲";
        options.style.display = "flex";
    };
};

const updateDots = (source) => {
    const dots = source.parentElement.querySelectorAll(".option-preview-dot");

    const options = source.querySelectorAll(".clickable>input[type='checkbox']");

    options.forEach((option, index) => {
        if (option.checked) {
            dots[index].classList.add("checked");
        } else {
            dots[index].classList.remove("checked");
        }
    });
};

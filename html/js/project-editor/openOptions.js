
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

const optionButtons = document.querySelectorAll(".blocks .block h3.option");

optionButtons.forEach(button => {
    button.addEventListener("click", () => {
        expandOptions(button);
    });
    button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            expandOptions(button);
        };
    });
});


const checkCheckbox = (source) => {
    const checkbox = source.querySelector("input[type='checkbox']");
    checkbox.checked = !checkbox.checked;
};

const checkboxAreas = document.querySelectorAll(".block .options div div");

checkboxAreas.forEach(checkbox => {
    checkbox.addEventListener("click", () => {
        checkCheckbox(checkbox);
    });
    checkbox.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            checkCheckbox(checkbox);
        };
    });
});
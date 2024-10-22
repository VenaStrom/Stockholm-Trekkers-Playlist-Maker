
document.addEventListener("keydown", (event) => {
    if (!(event.key === "Enter" || event.key === " ")) {
        return;
    };

    // Prevents the page from scrolling when pressing the space bar
    if (event.key === " ") { event.preventDefault() };

    if (event.target.classList.contains("clickable")) {
        event.preventDefault();

        // if it has a child, click it instead
        if (event.target.querySelector("*")) {
            event.target.querySelector("*").click();
        } else {
            event.target.click();
        }
    };
});

document.addEventListener("click", (event) => {
    const target = event.target;
    const parent = event.target.parentElement;

    if (parent.classList.contains("clickable")) {
        if (
            target.tagName === "P"
            &&
            parent.querySelector("input")
        ) {
            parent.querySelector("input").click();
        };
    } else if (target.classList.contains("clickable")) {
        if (
            target.querySelector("p")
            &&
            target.querySelector("input")
        ) {
            target.querySelector("input").click();
        };
    };
});
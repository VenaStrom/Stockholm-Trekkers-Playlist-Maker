

document.addEventListener("keydown", (event) => {
    if (!(event.key === "Enter" || event.key === " ")) {
        return;
    };

    // Prevents the page from scrolling when pressing the spacebar
    if (event.key === " ") { event.preventDefault() };

    if (event.target.classList.contains("clickable")) {
        if (event.target.hasAttribute("onclick")) { event.target.click() };
        if (event.target.querySelector("img")) { event.target.querySelector("img").click() };
        if (event.target.querySelector("input")) { event.target.querySelector("input").click() };
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
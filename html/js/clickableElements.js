
const clickables = document.querySelectorAll(".clickable");

clickables.forEach(clickable => {
    clickable.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.target.click();
        }
        else if (event.key === " ") {
            event.preventDefault();
            event.target.click();
        }
    });
});
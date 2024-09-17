
document.addEventListener("keydown", (event) => {
    if (!(event.key === "Enter" || event.key === " ")) {
        return;
    };
    if (event.target.classList.contains("clickable")) {
        event.target.click();
        event.target.querySelector("&>input").click();
    };
});
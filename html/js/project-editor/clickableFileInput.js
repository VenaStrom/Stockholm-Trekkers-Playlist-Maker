
// The input elements aren't focusable via tabing so if you press enter or 
// space on the div containing the input it should click the input

const fileContainers = document.querySelectorAll(".block div.file");

fileContainers.forEach(fileContainer => {
    fileContainer.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.target.querySelector("input[type='file']").click();
        }
        else if (event.key === " ") {
            event.preventDefault();
            event.target.querySelector("input[type='file']").click();
        }
    });
});
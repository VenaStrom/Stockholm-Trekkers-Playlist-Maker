
const backButton = document.querySelector("#back-button");
const nameValidatorStatus = document.querySelector(".name-validator-status");
const nameInput = document.querySelector(".name-input>input");
const warningsWindow = document.getElementById("name-validation-popover");
let popoverTimeout;
let statusTimeout;

backButton.addEventListener("click", () => {
    window.location.href = "./projects.html";
});

const nameValidator = (event) => {
    if (event.key !== "Enter") { return; }

    clearTimeout(popoverTimeout);
    clearTimeout(statusTimeout);

    const warnings = (name) => {
        const date = new Date(name);

        const warnings = [];

        if (date == "Invalid Date") {
            warnings.push("It's not a valid date. ");
        }
        if (!(date.getDay() in [6, 0])) {
            warnings.push("It's on a weekday. ");
        }
        if (date.getFullYear() !== new Date().getFullYear()) {
            warnings.push("It's not this year. ");
        }
        if (date < new Date()) {
            warnings.push("It's in the past. ");
        }
        if (date.getTime() > new Date().getTime() + 5184000000) {
            warnings.push("It's more than 2 months away. ");
        }

        if (warnings.length > 0) {
            nameValidatorStatus.textContent += " But are you sure about: ";

            warningsWindow.innerHTML = "";

            warnings.forEach(warning => {
                const warningTag = document.createElement("p");
                warningTag.textContent = warning;
                warningsWindow.appendChild(warningTag);
            });

            warningsWindow.showPopover();
        }

        popoverTimeout = setTimeout(() => {
            warningsWindow.hidePopover();
        }, 5000);
    }


    const name = nameInput.value.trim();
    const nameRegex = /^\d{4}[-./,\s]\d{2}[-./,\s]\d{2}$/;
    const nameRegexNoSeparator = /^\d{8}$/;

    if (nameRegex.test(name)) {
        nameValidatorStatus.textContent = "Looks good!";
        nameValidatorStatus.classList.remove("invalid");

        const formattedName = name.replace(/[-./,\s]/g, "-");
        nameInput.value = formattedName;
        warnings(formattedName);

    } else if (nameRegexNoSeparator.test(name)) {
        nameValidatorStatus.textContent = "Looks good!";
        nameValidatorStatus.classList.remove("invalid");

        const formattedName = name.slice(0, 4) + "-" + name.slice(4, 6) + "-" + name.slice(6, 8);
        nameInput.value = formattedName;
        warnings(formattedName);

    } else {
        nameValidatorStatus.textContent = "Invalid";
        nameValidatorStatus.classList.add("invalid");
    }

    if (nameValidatorStatus.textContent === "Looks good!") {
        statusTimeout = setTimeout(() => {
            nameValidatorStatus.textContent = "";
            nameValidatorStatus.classList.remove("invalid");
        }, 5000);
    }
}

nameInput.addEventListener("blur", nameValidator);
nameInput.addEventListener("keydown", nameValidator);

const dateValidator = (inputDate) => {

    const date = new Date(inputDate);

    const warnings = [];

    if (date == "Invalid Date") {
        warnings.push("That's not a valid date.");

        return warnings; // There's no point in checking further if the date is invalid since the rest of the checks rely on the date object
    };
    if (!(date.getDay() === 0 || date.getDay() === 6)) {
        warnings.push("That's on a weekday. Are you sure?");
    };
    if (date.getFullYear() !== new Date().getFullYear()) {
        warnings.push("That's not the current year. Are you sure?");
    };
    if (date < new Date()) {
        warnings.push("That's in the past.");
    };
    if (date.getTime() > new Date().getTime() + 2592000000) {
        warnings.push("That's more than 1 month away. Are you sure?");
    };

    return warnings;
}

document.querySelector(".date-input>input").addEventListener("blur", (event) => {
    const date = event.target.value;
    const warnings = dateValidator(date);

    warningPopup("date-warning-popup-id", event.target, warnings);
});
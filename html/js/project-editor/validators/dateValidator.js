
const dateValidator = (inputDate) => {

    const date = new Date(inputDate);

    const warnings = [];

    if (date == "Invalid Date") {
        warnings.push("It's not a valid date. ");
    };
    if (!(date.getDay() === 0 || date.getDay() === 6)) {
        warnings.push("It's on a weekday. ");
    };
    if (date.getFullYear() !== new Date().getFullYear()) {
        warnings.push("It's not this year. ");
    };
    if (date < new Date()) {
        warnings.push("It's in the past. ");
    };
    if (date.getTime() > new Date().getTime() + 5184000000) {
        warnings.push("It's more than 2 months away. ");
    };

    return warnings;
}

document.querySelector(".date-input>input").addEventListener("blur", (event) => {
    const date = event.target.value;
    const warnings = dateValidator(date);

    warningPopup("date-warning-popup-id", event.target, warnings);
});
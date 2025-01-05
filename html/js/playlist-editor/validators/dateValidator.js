"use strict";

const dateValidator = (inputDate) => {
    const date = new Date(inputDate);

    const warnings = [];

    // Empty date
    if (inputDate === "") {
        return warnings; // Don't scream at the user if the input is empty
    };

    // Invalid date
    if (date == "Invalid Date") { // "=="" cause the types are different
        warnings.push("Not a valid date.");

        return warnings; // There's no point in checking further if the date is invalid since the rest of the checks rely on the date object
    };

    // First contact day 2063-04-05
    if (
        date.getFullYear() === 2063
        &&
        date.getMonth() === 3
        &&
        date.getDate() === 5
    ) {
        warnings.push("Live long and prosper 🖖");
    }

    // Today
    if (date.toDateString() === new Date().toDateString()) {
        warnings.push("Today. Are you sure?");
    };

    // Weekday
    if (!(date.getDay() === 0 || date.getDay() === 6)) {
        warnings.push("On a weekday. Are you sure?");
    };

    // Current year
    if (date.getFullYear() !== new Date().getFullYear()) {
        warnings.push("Not the current year. Are you sure?");
    };

    // Past date
    if (date < new Date()) {
        warnings.push("In the past.");
    };

    // More than 1 month away
    if (date.getTime() > new Date().getTime() + 2592000000) {
        warnings.push("More than 1 month away. Are you sure?");
    };

    return warnings;
}

// Add validator to the date input
const dateInput = document.querySelector(".date-input input[type='text']");
const validateDateInput = (event) => {
    const target = event.target;
    const warnings = dateValidator(target.value);

    attachPrompt(target, warnings);
};
dateInput.addEventListener("validate-date", validateDateInput);

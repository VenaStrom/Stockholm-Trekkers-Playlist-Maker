
const dateValidator = (inputDate) => {
    const date = new Date(inputDate);

    const warnings = [];

    if (date == "Invalid Date") {
        warnings.push("Not a valid date.");

        return warnings; // There's no point in checking further if the date is invalid since the rest of the checks rely on the date object
    };
    if ( // First contact day 2063-04-05
        date.getFullYear() === 2063
        &&
        date.getMonth() === 3
        &&
        date.getDate() === 5
    ) { 
        warnings.push("Live long and prosper 🖖");
    }
    if (!(date.getDay() === 0 || date.getDay() === 6)) {
        warnings.push("On a weekday. Are you sure?");
    };
    if (date.getFullYear() !== new Date().getFullYear()) {
        warnings.push("Not the current year. Are you sure?");
    };
    if (date < new Date()) {
        warnings.push("In the past.");
    };
    if (date.getTime() > new Date().getTime() + 2592000000) {
        warnings.push("More than 1 month away. Are you sure?");
    };

    return warnings;
}

// This function is run from the dateFormatter.js file
const validateDate = (source) => {
    const date = source.value;
    const warnings = dateValidator(date);

    warningPopup("date-warning-popup-id", source, warnings);
};
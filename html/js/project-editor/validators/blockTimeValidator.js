
const earliestTime = 9;
const latestTime = 20;

const validateTime = (time) => {
    const warnings = [];

    const [hours, minutes] = time.split(":").map(Number);

    // Empty or invalid time
    if (time === "") {
        warnings.push("Time is empty.");

        return warnings; // No need to check further
    }
    if (
        time.length !== 5
        ||
        !time.includes(":")
        ||
        isNaN(hours)
    ) {
        warnings.push("Time must be in the format HH:MM.");

        return warnings; // No need to check further
    }

    // Standard time format checks
    if (hours < 0 || hours > 23) {
        warnings.push("Hours must be between 0 and 23.");

        return warnings; // No need to check further
    }
    if (minutes < 0 || minutes > 59) {
        warnings.push("Minutes must be between 0 and 59.");

        return warnings; // No need to check further
    }

    // Is it a bit too early?
    if (hours < earliestTime) {
        warnings.push("It's a bit early. Are you sure?");
    }
    // Is it a bit too late?
    if (hours > latestTime) {
        warnings.push("It's a bit late. Are you sure?");
    }
    // Odd times
    if (minutes % 5 !== 0) {
        warnings.push("It's an odd time. Are you sure?");
    }

    const blocks = document.querySelectorAll(".block");
    const blockTimes = Array.from(blocks).map(block => block.querySelector(".time input[type='text']").value);

    // Duplicate time
    if (blockTimes.filter(blockTime => blockTime === time).length > 1) {
        warnings.push("Duplicate time.");
    }



    return warnings;
};

const blockTimeValidator = (event) => {

    const time = event.target.value;
    const warnings = validateTime(time);

    const blocks = document.querySelectorAll(".block");
    const blockTimes = Array.from(blocks).map(block => block.querySelector(".time input[type='text']").value);
    const blockIndex = blockTimes.indexOf(time);
    const id = "block-time-warning-popup-id" + blockIndex;
    warningPopup(id, event.target, warnings);
};
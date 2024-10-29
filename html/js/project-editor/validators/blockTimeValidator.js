
const earliestTime = 9;
const latestTime = 20;

const blockTimeValidator = (event) => {
    const warnings = [];

    const time = event.target.value;
    const [hours, minutes] = time.split(":").map(Number);

    // Empty time
    if (time === "") {
        warnings.push("Time is empty.");
    }
    if (
        time.length !== 5
        ||
        !time.includes(":")
        ||
        isNaN(hours)
    ) {
        warnings.push("Time must be in the format HH:MM.");
    }

    // Standard time format checks
    if (hours < 0 || hours > 23) {
        warnings.push("Hours must be between 0 and 23.");
    }
    if (minutes < 0 || minutes > 59) {
        warnings.push("Minutes must be between 0 and 59.");
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

    const blockIndex = blockTimes.indexOf(time);
    const id = "block-time-warning-popup-id" + blockIndex;
    warningPopup(id, event.target, warnings);
};
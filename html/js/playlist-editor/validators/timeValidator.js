"use strict";


const validateTime = (timeInput) => {
    const time = timeInput.value;
    const [hours, minutes] = time.split(":").map(Number);

    const warnings = [];

    // Empty check
    if (time === "") {
        warnings.push("Time is empty.");

        return warnings; // No need to check further
    }

    // Format check
    if (!time.match(/^\d{1,2}:\d{2}$/)) {
        warnings.push("Must be in format HH:MM.");
    }

    // Time bound check
    if (hours > 23 || hours < 0 || minutes > 59 || minutes < 0) {
        warnings.push("Invalid time.");

        return warnings; // No need to check further
    }

    // Too early check
    if (hours < 9) {
        warnings.push("Very early. Are you sure?");
    }

    // Too late check
    if (hours > 20) {
        warnings.push("Very late. Are you sure?");
    }

    // Odd time check
    if (minutes % 5 !== 0) {
        warnings.push("Odd time. Are you sure?");
    }

    // 47 check - Easter Egg :)
    if (minutes === 47) {
        warnings.push("47!");
    }

    // Duplicate time check
    const blockTimes = [...document.querySelectorAll(".block .start-time input")].map((timeInput) => timeInput.value);
    if (blockTimes.filter((blockTime) => blockTime === time).length > 1) {
        warnings.push("Duplicate time.");
    }

    

    // Attach the prompt
    attachPrompt(timeInput, warnings);
};

const validateAllBlockTimes = () => {
    const blockTimes = document.querySelectorAll(".block .start-time input");

    blockTimes.forEach((blockTime) => {
        validateTime(blockTime);
    });
};
document.addEventListener("validateTimes", validateAllBlockTimes);
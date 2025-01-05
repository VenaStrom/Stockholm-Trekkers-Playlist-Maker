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

    // 1701 check - Easter Egg :)
    if (hours === 17 && minutes === 1) {
        warnings.push("1701!");
    }

    // Duplicate time check
    const blockTimes = [...document.querySelectorAll(".block .start-time input")].map((timeInput) => timeInput.value);
    if (blockTimes.filter((blockTime) => blockTime === time).length > 1) {
        warnings.push("Duplicate time.");
    }

    // Overlapping with previous
    const previousBlock = timeInput.closest(".block").previousElementSibling;
    if (
        previousBlock
        &&
        previousBlock.classList.contains("block")
        &&
        previousBlock.querySelector(".start-time input[type='text']").value // Check if the previous block has a time
    ) {
        // Get the last episode time of the previous block
        const prevSiblingEpisodes = [...previousBlock.querySelectorAll(".episode .time")];
        const [lastHours, lastMinutes] = prevSiblingEpisodes.at(-1).textContent.split(":").map(Number);

        // If they overlap, warn
        if (lastHours > hours || (lastHours === hours && lastMinutes > minutes)) {
            warnings.push("Overlapping times with previous block.");
        }
    }

    // Overlapping with next
    const nextBlock = timeInput.closest(".block").nextElementSibling;
    if (
        nextBlock
        &&
        nextBlock.classList.contains("block")
        &&
        nextBlock.querySelector(".start-time input[type='text']").value // Check if the next block has a time
    ) {
        // Get the last episode time of the current block
        const siblingEpisodes = [...timeInput.closest(".block").querySelectorAll(".episode .time")];
        const lastEpisode = siblingEpisodes.at(-1).textContent;
        const [lastHours, lastMinutes] = lastEpisode.split(":").map(Number);

        // Get the block start time of the next block
        const [nextHours, nextMinutes] = nextBlock.querySelector(".start-time input[type='text']").value.split(":").map(Number);

        // If they overlap, warn
        if (lastHours > nextHours || (lastHours === nextHours && lastMinutes > nextMinutes)) {
            warnings.push("Overlapping times with next block.");
        }
    }

    // Attach the prompt
    attachPrompt(timeInput, warnings);
};

const validateAllBlockTimes = () => {
    const blockTimes = [...document.querySelectorAll(".block .start-time input")];

    blockTimes.forEach((blockTime) => {
        validateTime(blockTime);
    });
};
document.addEventListener("validateTimes", validateAllBlockTimes);
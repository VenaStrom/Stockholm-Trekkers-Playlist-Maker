
// If the imputed time is less than 9 or greater than 20, a warning will be displayed.
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

    // 47! This is an easter egg.
    if (minutes === 47) {
        warnings.push("47!");
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
    const previousBlock = blocks[blockIndex - 1] || null;
    const nextBlock = blocks[blockIndex + 1] || null;

    // Overlapping time
    if (previousBlock) {
        const previousBlockEpisodes = Array.from(previousBlock.querySelectorAll(".episode")).reverse();

        // Finds the last time in the previous block that isn't unset
        let previousTime = "--:--";
        for (const episode of previousBlockEpisodes) {
            const episodeTime = episode.querySelector(".time>p").textContent;

            if (episodeTime !== "--:--") {
                previousTime = episodeTime;
                break;
            }
        }

        if (previousTime !== "--:--") {
            const [previousHours, previousMinutes] = previousTime.split(":").map(Number);

            if (hours < previousHours || (hours === previousHours && minutes < previousMinutes)) {
                warnings.push("Time overlaps with the previous block.");
            }
        }
    }

    return warnings;
};

const timeValidator = (event) => {

    const time = event.target.value;
    const warnings = validateTime(time);

    const blocks = document.querySelectorAll(".block");
    const blockTimes = Array.from(blocks).map(block => block.querySelector(".time input[type='text']").value);
    const blockIndex = blockTimes.indexOf(time);
    const id = "block-time-warning-popup-id" + blockIndex;
    warningPopup(id, event.target, warnings);
};
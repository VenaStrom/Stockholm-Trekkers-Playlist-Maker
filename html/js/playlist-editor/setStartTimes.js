
// Interpret the users time input to a four digit time
const interpretUserTimeInput = (time) => {
    time = time.replace(/[^0-9]/g, ""); // Only allow numbers

    if (time.length === 1) {
        return `0${time}:00`;
    }
    if (time.length === 2) {
        if (parseInt(time) > 23) {
            return `0${time[0]}:${time[1]}0`;
        } else {
            return `${time}:00`;
        }
    }
    if (time.length === 3) {
        if (parseInt(time[0] + time[1]) > 23) {
            return `0${time[0]}:${time[1]}${time[2]}`;
        } else {
            return `${time[0]}${time[1]}:${time[2]}0`;
        }
    }
    if (time.length >= 4) { // Greater than our equal since I assume a user types the first digits correctly and I let the rest overflow

        // If over 23 hours, cap it
        if (parseInt(time[0] + time[1]) > 23) { // + is string concatenation
            return `23:59`;
        }

        return `${time[0]}${time[1]}:${time[2]}${time[3]}`;
    }
    return undefined;
};

const secondsToHHMM = (seconds) => {
    const hours = Math.floor(seconds / 60 / 60);
    const minutes = Math.round((seconds - hours * 60 * 60) / 60); // Lossy

    return `${hours}:${minutes.toString().padStart(2, "0")}`;
};

const HHMMToSeconds = (hhmm) => {
    const [hours, minutes] = interpretUserTimeInput(hhmm).split(":");

    return hours * 60 * 60 + minutes * 60;
};

const updateEpisodeDurationsInBlock = (block) => {
    const episodes = block.querySelectorAll(".episode");

    // Recursively get the duration of each episode. This is done to avoid async issues and to not overload ffmpeg/ffprobe
    const updateEpisode = (index, resolve) => {
        if (index >= episodes.length) {
            resolve(); // Resolve when all episodes are processed
            return;
        }

        const episode = episodes[index];
        const episodeFileInput = episode.querySelector(".file input[type='file']");

        // Skip if there's no file
        if (!episodeFileInput.value) {
            updateEpisode(index + 1, resolve);
            return;
        }

        // Uses ffprobe to get metadata about the file, namely the duration
        metadata.get(episodeFileInput.dataset.filePath)
            .then((data) => {
                // Save the duration in the dataset of the input element
                episodeFileInput.dataset.duration = data.format.duration;

                updateEpisode(index + 1, resolve);
            })
            .catch((error) => {
                console.error(error);

                updateEpisode(index + 1, resolve);
            });
    };

    return new Promise((resolve) => updateEpisode(0, resolve));
};

const clearEpisodeTime = (episode) => {
    episode.querySelector(".time p").textContent = "--:--";
};

const clearAllEpisodeTimesInBlock = (block) => {
    const episodes = block.querySelectorAll(".episode");

    episodes.forEach((episode) => {
        clearEpisodeTime(episode);
    });
};

const setStartTimesInBlock = (block) => {
    const episodes = block.querySelectorAll(".episode");
    const blockTime = block.querySelector(".time input[type='text']").value;

    // If the block time isn't set, there's no reference point to set the start times to so stop
    if (!blockTime) { clearAllEpisodeTimesInBlock(block); return; }

    // The head is gonna be incremented with the episode durations to easily set their start times
    let head = HHMMToSeconds(blockTime); // Seconds

    // If block time is somehow NaN, stop
    if (isNaN(head)) { clearAllEpisodeTimesInBlock(block); return; }

    episodes.forEach((episode, index) => {
        const episodeTimeDOM = episode.querySelector(".time p");
        const episodeFileInput = episode.querySelector(".file input[type='file']");

        // Handle missing file
        if (!episodeFileInput.value) {
            // Always clear the time if there's no file
            clearEpisodeTime(episode);

            // If this is the last episode, try to set the time to the end time of the previous episode
            if (index === episodes.length - 1) {
                const previousEpisode = episodes[index - 1];
                const previousEpisodeDuration = previousEpisode.querySelector(".file input[type='file']").dataset.duration;
                const previousEndTime = previousEpisode.querySelector(".time p").dataset.endTime;

                // See that everything is defined before setting the time
                if (previousEpisode && previousEpisodeDuration && previousEndTime) {
                    episodeTimeDOM.textContent = previousEndTime;
                }
            }

            return;
        }

        const duration = parseFloat(episodeFileInput.dataset.duration); // Seconds

        // If the duration is unset, skip this episode
        if (duration === undefined || isNaN(duration)) { return; }

        episodeTimeDOM.textContent = secondsToHHMM(head);

        head += duration;

        // Save the episode end time as well. This is mostly used for setting the trailing empty episodes time signifying the end time of the block
        episodeTimeDOM.dataset.endTime = secondsToHHMM(head);
    });

    // This triggers the validators for all the blocks since they rely on the episode times to check for overlaps. See, blockTimeValidator.js
    document.querySelectorAll(".block").forEach((block) => {
        block.querySelector(".time>input[type='text']").dispatchEvent(new Event("blur"));
    });
}

// Used in the createBlockDOM function in the createBlockAndEpisodes.js file
const formatBlockTime = (event) => {
    const timeInput = event.target;

    const interpretedTime = interpretUserTimeInput(timeInput.value);
    if (interpretedTime) {
        timeInput.value = interpretedTime;
    }
}

// Used in the createBlockDOM function in the createBlockAndEpisodes.js file
const updateEpisodeTimesInBlock = (event) => {
    const emitter = event.target;

    // This ugly condition block is there since multiple elements can trigger this event but not everything. This is highly implementation specific
    if ( 
        emitter.tagName === "INPUT"
        &&
        (
            emitter.type === "file"
            ||
            emitter.type === "text"
        )
        ||
        emitter.classList.contains("block") // allow events from the block itself since the loading function in load.js dispatches a change event on the block
    ) {
        const block = emitter.closest(".block");
        
        // Make sure all the episodes have their durations saved
        updateEpisodeDurationsInBlock(block).then(() => {

            // Then, update the times of the episodes
            setStartTimesInBlock(block);
        });
    }
}

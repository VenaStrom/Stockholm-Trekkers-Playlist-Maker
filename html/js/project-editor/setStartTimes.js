
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
    if (time.length === 4) {
        if (parseInt(time[0] + time[1]) > 23) {
            return `23:${time[2]}${time[3]}`;
        } else {
            return `${time[0]}${time[1]}:${time[2]}${time[3]}`;
        }
    }
    return undefined;
};

const secondsToFormattedTime = (seconds) => {
    const hours = Math.floor(seconds / 60 / 60);
    const minutes = Math.round((seconds - hours * 60 * 60) / 60);

    return `${hours}:${minutes.toString().padStart(2, "0")}`;
};

const fetchEpisodeDurationsInBlock = (block) => {
    const episodes = block.querySelectorAll(".episode");

    const updateEpisode = (index, resolve) => {
        if (index >= episodes.length) {
            resolve(); // Resolve when all episodes are processed
            return;
        }

        const episode = episodes[index];
        const episodeFileInput = episode.querySelector(".file input[type='file']");

        if (!episodeFileInput.value) {
            updateEpisode(index + 1, resolve); // Skip if no file
            return;
        }

        // Uses ffprobe to get metadata about the file
        metadata.get(episodeFileInput.dataset.filePath)
            .then((data) => {

                // Save the duration
                episodeFileInput.dataset.duration = data.format.duration;

                updateEpisode(index + 1, resolve); // Move to the next episode
            })
            .catch((error) => {
                console.error(error);

                updateEpisode(index + 1, resolve);
            });
    };

    return new Promise((resolve) => updateEpisode(0, resolve));
};

const zeroAllEpisodesInBlock = (block) => {
    const episodes = block.querySelectorAll(".episode");

    episodes.forEach((episode) => {
        episode.querySelector(".time p").textContent = "--:--";
    });
}

const setEpisodeStartTimesInBlock = (block) => {
    const episodes = block.querySelectorAll(".episode");
    const blockTime = block.querySelector(".time input[type='text']").value;

    if (!blockTime) { zeroAllEpisodesInBlock(block); return; }

    let head = parseFloat(blockTime.split(":")[0] * 60 * 60 + blockTime.split(":")[1] * 60); // seconds

    if (isNaN(head)) { zeroAllEpisodesInBlock(block); return; }

    episodes.forEach((episode, index) => {
        // Skip if no file
        if (!episode.querySelector(".file input[type='file']").value) {
            if (episodes[index - 1] && episodes[index - 1].querySelector(".file input[type='file']").value) {
                // If the previous episode has a file and this one doesn't, set time to it's end time
                episode.querySelector(".time p").textContent = episodes[index - 1].querySelector(".time p").dataset.endTime;
            } else {
                // Otherwise, set time to "--:--"
                episode.querySelector(".time p").textContent = "--:--";
            }
            return;
        }

        const episodeTimeDOM = episode.querySelector(".time p");
        const episodeFileInput = episode.querySelector(".file input[type='file']");
        const duration = parseFloat(episodeFileInput.dataset.duration);

        episodeTimeDOM.textContent = secondsToFormattedTime(head);

        head += duration;

        // Save the episode end time as well
        episodeTimeDOM.dataset.endTime = secondsToFormattedTime(head);
    });

    // This triggers the validators for all the blocks since they rely on the episode times to check for overlaps. See, blockTimeValidator.js
    document.querySelectorAll(".block").forEach((block) => {
        block.querySelector(".time>input[type='text']").dispatchEvent(new Event("blur"));
    });
}

// Formats time in block time input to HH:MM
// Used in the createBlockDOM function in the createBlockAndEpisodes.js file
const formatBlockTime = (event) => {
    const timeInput = event.target;

    // Interpret the time input
    const interpretedTime = interpretUserTimeInput(timeInput.value);
    // If the interpreter can't parse the time, don't change the value
    if (interpretedTime) {
        timeInput.value = interpretedTime;
    }
}

// Used in the createBlockDOM function in the createBlockAndEpisodes.js file
const updateEpisodeTimesInBlock = (event) => {
    const emitter = event.target;
    if ( // If the block time, or episode files change...
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
        // Make sure all the episodes have their durations saved
        const block = emitter.closest(".block");
        fetchEpisodeDurationsInBlock(block).then(() => {

            // Then, update the times of the episodes
            setEpisodeStartTimesInBlock(block);
        });
    }
}

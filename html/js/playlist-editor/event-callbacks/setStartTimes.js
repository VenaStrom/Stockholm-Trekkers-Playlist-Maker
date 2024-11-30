
const updateEpisodeDurationsInBlock = (block) => {
    console.log("Getting times in block", block);

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
        ffprobe.get(episodeFileInput.dataset.filePath)
            .then((data) => {
                if (!data) {
                    console.error("No data returned from ffprobe");
                    updateEpisode(index + 1, resolve);
                    return;
                }

                // Save the duration in the DOM of the input element to be accessed later
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
    console.log("Setting times in block", block);

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
};
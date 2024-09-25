
const lintTime = (time) => {
    time = time.replace(/[^0-9]/g, "");

    if (time.length === 1) {
        return `0${time}:00`;
    }
    if (time.length === 2) {
        return `${time}:00`;
    }
    if (time.length === 3) {
        return `${time[0]}${time[1]}:${time[2]}0`;
    }
    if (time.length === 4) {
        return `${time[0]}${time[1]}:${time[2]}${time[3]}`;
    }
    return "--:--";
};

const secondsToTime = (seconds) => {
    const hours = Math.floor(seconds / 60 / 60);
    const minutes = Math.round((seconds - hours * 60 * 60) / 60);

    return `${hours}:${minutes}`;
};

const updateTimes = () => {
    const timeLinters = document.querySelectorAll(".time-lint");

    // Lint times
    timeLinters.forEach((trigger) => {
        if (trigger.tagName === "INPUT") {
            trigger.value = lintTime(trigger.value);

        } else if (trigger.tagName === "P") {
            trigger.textContent = lintTime(trigger.textContent);
        }
    });

    // Update a block at a time
    const blocks = document.querySelectorAll(".block");
    blocks.forEach((block) => {
        if (!block.querySelector(".time input[type='text']")) { return }

        const blockTime = block.querySelector(".time input[type='text']").value;
        let head = parseFloat(blockTime.split(":")[0] * 60 * 60 + blockTime.split(":")[1] * 60); // seconds

        // Loop through and set the durations of the episodes
        const episodes = block.querySelectorAll(".episode");

        const doEpisode = (episodes, index) => {
            // Get the duration of the episode
            if (!episodes[index].querySelector(".file input[type='file']").value) { return }
            metadata.get(episodes[index].querySelector(".file input[type='file']").dataset.filePath)
                .then((metadata) => {
                    if (index >= episodes.length - 1) { return }

                    const episode = episodes[index];
                    const timDOM = episode.querySelector(".time p");
                    const fileInput = episode.querySelector(".file input[type='file']");
                    const duration = parseFloat(metadata.format.duration);
                    fileInput.dataset.duration = duration;

                    timDOM.textContent = secondsToTime(head);

                    head += duration;

                    doEpisode(episodes, index + 1);
                });
        };

        doEpisode(episodes, 0);
    });
};

// Update times on change
document.addEventListener("change", (event) => {
    if (event.target.classList.contains("update-times")) {
        updateTimes();
    }
});
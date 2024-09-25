
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
    const minutes = Math.floor((seconds - hours * 60 * 60) / 60);

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


        // Loop through and set the durations of the episodes
        const episodes = block.querySelectorAll(".episode");
        episodes.forEach(episode => {
            const fileInput = episode.querySelector(".file input[type='file']");
            if (!fileInput.value) { return; }
            if (!fileInput.dataset.filePath) { raiseError("no file path found for" + JSON.stringify(episode)); return; }

            metadata.get(fileInput.dataset.filePath).then((metadata) => {
                const episodeDuration = metadata.format.duration;
                fileInput.dataset.duration = episodeDuration;
            });
        });

        // Calculate the start times
        const blockTime = block.querySelector(".time input[type='text']").value;
        console.log(blockTime);

        // const blockTime = block.querySelector(".time input[type='text']");
        // const blockTimeSeconds = blockTime.value.split(":")[0] * 60 * 60 + blockTime.value.split(":")[1] * 60;

        // let timeHead = blockTimeSeconds;

        // const episodes = block.querySelectorAll(".episode");
        // Array.from(episodes)
        //     .filter((episode) => episode.querySelector(".file input[type='file']").value)
        //     .forEach((episode, index) => {
        //         if (!episode.querySelector(".file input[type='file']").value) { return }

        //         const fileInput = episode.querySelector(".file input[type='file']");

        //         if (!fileInput.dataset.filePath) { return }

        //         metadata.get(fileInput.dataset.filePath).then((metadata) => {
        //             const episodeDuration = metadata.format.duration;
        //             console.log(fileInput.value, episodeDuration);
        //             const episodeTimeSeconds = episodeDuration.split(":")[0] * 60 * 60 + episodeDuration.split(":")[1] * 60;

        //             const episodeTimeText = secondsToTime(timeHead);

        //             console.log(timeHead, episodeTimeSeconds);
        //             timeHead += episodeTimeSeconds;

        //             episode.querySelector(".time p").textContent = episodeTimeText;

        //         });
        //     });
    });
};


const blockTimes = document.querySelectorAll(".time input[type='text']")
    .forEach(blockTime => {
        blockTime.addEventListener("change", updateTimes);
    });

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
        const [hour, minute] = block.querySelector(".time input[type='text']").value.split(":");
        const blockStartTime = 60 * (hour * 60 + minute); // total seconds

        const episodes = block.querySelectorAll(".episode");
        episodes.forEach((episode) => {
            const timeDOM = episode.querySelector(".time p");
            const fileDOM = episode.querySelector(".file input[type='file']");
            const duration = fileDOM.getAttribute("data-duration"); // duration in seconds

            const fileStartTimeMinutes = blockStartTime + duration

            timeDOM.textContent = lintTime((fileStartTimeMinutes / 60).toFixed(0) + "" + (fileStartTimeMinutes % 60).toFixed(0));
        });
    });
};

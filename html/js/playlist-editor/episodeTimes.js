"use strict";

const hhmmToSeconds = (hhmm) => {
    const [hours, minutes] = hhmm.split(":").map((num) => parseInt(num));
    return hours * 3600 + minutes * 60;
};

const secondsToHhmm = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const hoursString = hours.toString().padStart(2, "0");
    const minutesString = minutes.toString().padStart(2, "0");

    return `${hoursString}:${minutesString}`;
}

const updateEpisodeTimes = async (block) => {
    const episodes = [...block.querySelectorAll(".episode")];

    // Ignore if the block doesn't have a start time
    if (!block.querySelector(".start-time input[type='text']").value) {
        episodes.forEach((episode) => {
            episode.querySelector(".time").textContent = "--:--";
            episode.querySelector(".time").dataset.endTime = "--:--";
        });    
        return;
    }

    // Get durations for all episodes
    const durations = await Promise.all(episodes.map(async (episode) => {
        const fileInput = episode.querySelector("input[type='file']");
        const filePath = fileInput.dataset.filePath;

        if (!filePath) {
            return 0;
        }

        return parseFloat(await ffprobe.duration(filePath));
    }));

    // Store durations in the input elements
    episodes.forEach((episode, index) => {
        const fileInput = episode.querySelector("input[type='file']");
        fileInput.dataset.duration = durations[index];
    });

    // Update the start times for all episodes
    const startTime = block.querySelector(".start-time input[type='text']").value;
    let currentTime = hhmmToSeconds(startTime);

    durations.forEach((duration, index) => {
        const episodeDOM = episodes[index];
        const episodeTime = episodeDOM.querySelector(".time");

        if (!duration) {
            episodeTime.textContent = "--:--";
            return;
        }

        episodeTime.textContent = secondsToHhmm(currentTime);
        currentTime += duration;
        episodeTime.dataset.endTime = secondsToHhmm(currentTime);
    });
};

const interpretTime = (time) => {
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
    
    return time;
};

const secondsToHHMM = (seconds) => {
    const hours = Math.floor(seconds / 60 / 60);
    const minutes = Math.round((seconds - hours * 60 * 60) / 60); // Lossy

    return `${hours}:${minutes.toString().padStart(2, "0")}`;
};

const HHMMToSeconds = (hhmm) => {
    const [hours, minutes] = interpretTime(hhmm).split(":");

    return hours * 60 * 60 + minutes * 60;
};
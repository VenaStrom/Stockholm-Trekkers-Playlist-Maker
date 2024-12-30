"use strict";

const interpretTime = (time) => {
    time = time.replace(/[^0-9]/g, ""); // Only allow numbers
    time = time.slice(0, 4); // Only take the first 4 characters

    const num = (start, end) => {
        return time.slice(start, end);
    };

    const format = (hours, minutes) => {
        // Cap hours and minutes at 23 and 59 respectively
        if (parseInt(hours) > 23) hours = 23;
        if (parseInt(minutes) > 59) minutes = 59;

        hours = hours.toString().padStart(2, "0");
        minutes = minutes.toString().padStart(2, "0");

        return `${hours}:${minutes}`;
    };

    if (time.length === 4) {
        // Assume format is HH:MM
        return format(num(0, 2), num(2, 4));
    }

    if (time.length === 3) {
        // Assume format is 0H:MM or HH:M0

        const firstTwoDigits = parseInt(num(0, 2));

        if (firstTwoDigits < 24) {
            // Assume format is HH:M0
            return format(firstTwoDigits, num(2, 3) + "0");
        }
        else {
            // Assume format is 0H:MM
            return format(num(0, 1), num(1, 3));
        }
    }

    if (time.length === 2) {
        // Assume format is HH:00
        return format(num(0, 2), 0);
    }

    if (time.length === 1) {
        // Assume format is 0H:00
        return format(num(0, 1), 0);
    }

    // Fall back on returning the original time
    return time;
};


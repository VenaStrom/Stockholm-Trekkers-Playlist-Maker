"use strict";


const interpretDate = (date) => {
    date = date.replace(/\D/g, ""); // Only keep numbers

    if (date.length === 8) {
        // Assume the date is in the format YYYYMMDD
        return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    }

    if (date.length === 7) {
        // Assume the date is in the format YYYYMM0D
        return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 7).padStart(2, "0")}`;
    }

    if (date.length === 6) {
        // Assume the date is in the format YYMMDD
        const currentCentury = new Date().getFullYear().toString().slice(0, 2);
        return `${currentCentury}${date.slice(0, 2)}-${date.slice(2, 4)}-${date.slice(4, 6)}`;
    }

    if (date.length === 4) {
        // Assume the date is in the format MMDD
        const currentYear = new Date().getFullYear();
        return `${currentYear}-${date.slice(0, 2)}-${date.slice(2, 4)}`;
    }

    if (date.length === 3) {
        const firstTwoDigits = date.slice(0, 2);

        if (firstTwoDigits <= 12) {
            // Assume the date is in the format MM0D
            const currentYear = new Date().getFullYear();
            return `${currentYear}-${date.slice(0, 2).padStart(2, "0")}-${date.slice(2, 3).padStart(2, "0")}`;
        }
        else if (firstTwoDigits > 12) {
            // Assume the date is in the format MDD
            const currentYear = new Date().getFullYear();
            return `${currentYear}-${date.slice(0, 1).padStart(2, "0")}-${date.slice(1, 3)}`;
        }
    }

    if (date.length === 2) {
        // Assume the date is in the format DD

        if (date >= new Date().getDate()) {
            // If the day hasn't passed, assume it's this month
            return `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${date}`;
        }
        else if (date < new Date().getDate()) {
            // If the day has passed, assume it's next month
            return `${new Date().getFullYear()}-${new Date().getMonth() + 2}-${date}`;
        }
    }

    if (date.length === 1) {
        // Assume the date is in the format 0D

        if (date >= new Date().getDate()) {
            // If the day hasn't passed, assume it's this month
            return `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${date.padStart(2, "0")}`;
        }
        else if (date < new Date().getDate()) {
            // If the day has passed, assume it's next month
            return `${new Date().getFullYear()}-${new Date().getMonth() + 2}-${date.padStart(2, "0")}`;
        }
    }

    return date;
};

// Add the formatter to the date input
document.querySelector(".date-input>input").addEventListener("blur", (event) => {
    event.target.value = interpretDate(event.target.value);
});
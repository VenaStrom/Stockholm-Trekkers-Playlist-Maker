
const interpretDate = (date) => {
    if (!date) { return ""; }

    const strippedDate = date.replace(/\D/g, ""); // Only keep numbers

    if (strippedDate === "") {
        return "";
    }

    if (strippedDate.length === 8) {
        // Assume the date is in the format YYYYMMDD
        return `${strippedDate.slice(0, 4)}-${strippedDate.slice(4, 6)}-${strippedDate.slice(6, 8)}`;
    }

    if (strippedDate.length === 7) {
        // Assume the date is in the format YYYYMM0D
        return `${strippedDate.slice(0, 4)}-${strippedDate.slice(4, 6)}-${strippedDate.slice(6, 7).padStart(2, "0")}`;
    }

    if (strippedDate.length === 6) {
        // Assume the date is in the format YYMMDD
        const currentCentury = new Date().getFullYear().toString().slice(0, 2);
        return `${currentCentury}${strippedDate.slice(0, 2)}-${strippedDate.slice(2, 4)}-${strippedDate.slice(4, 6)}`;
    }

    if (strippedDate.length === 4) {
        // Assume the date is in the format MMDD
        const currentYear = new Date().getFullYear();
        return `${currentYear}-${strippedDate.slice(0, 2)}-${strippedDate.slice(2, 4)}`;
    }

    if (strippedDate.length === 3) {
        const firstTwoDigits = strippedDate.slice(0, 2);

        if (firstTwoDigits <= 12) {
            // Assume the date is in the format MM0D
            const currentYear = new Date().getFullYear();
            return `${currentYear}-${strippedDate.slice(0, 2).padStart(2, "0")}-${strippedDate.slice(2, 3).padStart(2, "0")}`;
        }
        else if (firstTwoDigits > 12) {
            // Assume the date is in the format MDD
            const currentYear = new Date().getFullYear();
            return `${currentYear}-${strippedDate.slice(0, 1).padStart(2, "0")}-${strippedDate.slice(1, 3)}`;
        }
    }

    if (strippedDate.length === 2) {
        // Assume the date is in the format DD

        if (strippedDate >= new Date().getDate()) {
            // If the day hasn't passed, assume it's this month
            return `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${strippedDate}`;
        }
        else if (strippedDate < new Date().getDate()) {
            // If the day has passed, assume it's next month
            return `${new Date().getFullYear()}-${new Date().getMonth() + 2}-${strippedDate}`;
        }
    }

    if (strippedDate.length === 1) {
        // Assume the date is in the format 0D

        if (strippedDate >= new Date().getDate()) {
            // If the day hasn't passed, assume it's this month
            return `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${strippedDate.padStart(2, "0")}`;
        }
        else if (strippedDate < new Date().getDate()) {
            // If the day has passed, assume it's next month
            return `${new Date().getFullYear()}-${new Date().getMonth() + 2}-${strippedDate.padStart(2, "0")}`;
        }
    }
};

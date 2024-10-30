
const dateInput = document.querySelector(".date-input>input");

const interpretDate = (date) => {
    if (date == "") { return; }

    const strippedDate = date.replace(/\D/g, "");

    if (strippedDate === "") {
        dateInput.value = "";
        return;
    }

    if (strippedDate.length === 8) {
        // Assume the date is in the format YYYYMMDD
        const formattedDate = `${strippedDate.slice(0, 4)}-${strippedDate.slice(4, 6)}-${strippedDate.slice(6, 8)}`;
        dateInput.value = formattedDate;
        return;
    }

    if (strippedDate.length === 6) {
        // Assume the date is in the format YYMMDD
        const currentCentury = new Date().getFullYear().toString().slice(0, 2);
        const formattedDate = `${currentCentury}${strippedDate.slice(0, 2)}-${strippedDate.slice(2, 4)}-${strippedDate.slice(4, 6)}`;
        return;
    }

    if (strippedDate.length === 4) {
        // Assume the date is in the format MMDD
        const currentYear = new Date().getFullYear();
        const formattedDate = `${currentYear}-${strippedDate.slice(0, 2)}-${strippedDate.slice(2, 4)}`;
        dateInput.value = formattedDate;
        return;
    }

    if (strippedDate.length === 3) {
        const firstTwoDigits = strippedDate.slice(0, 2);

        if (firstTwoDigits <= 12) {
            // Assume the date is in the format MM0D
            const currentYear = new Date().getFullYear();
            const formattedDate = `${currentYear}-${strippedDate.slice(0, 2).padStart(2, "0")}-${strippedDate.slice(2, 3).padStart(2, "0")}`;
            dateInput.value = formattedDate;
            return;
        }
        else if (firstTwoDigits > 12) {
            // Assume the date is in the format MDD
            const currentYear = new Date().getFullYear();
            const formattedDate = `${currentYear}-${strippedDate.slice(0, 1).padStart(2, "0")}-${strippedDate.slice(1, 3)}`;
            dateInput.value = formattedDate;
            return;
        }
    }

    if (strippedDate.length === 2) {
        // Assume the date is in the format DD

        if (strippedDate >= new Date().getDate()) {
            // If the day hasn't passed, assume it's this month

            const formattedDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${strippedDate}`;
            dateInput.value = formattedDate;
            return;
        }
        else if (strippedDate < new Date().getDate()) {
            // If the day has passed, assume it's next month

            const formattedDate = `${new Date().getFullYear()}-${new Date().getMonth() + 2}-${strippedDate}`;
            dateInput.value = formattedDate;
            return;
        }
    }

    if (strippedDate.length === 1) {
        // Assume the date is in the format 0D

        if (strippedDate >= new Date().getDate()) {
            // If the day hasn't passed, assume it's this month

            const formattedDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${strippedDate.padStart(2, "0")}`;
            dateInput.value = formattedDate;
            return;
        }
        else if (strippedDate < new Date().getDate()) {
            // If the day has passed, assume it's next month

            const formattedDate = `${new Date().getFullYear()}-${new Date().getMonth() + 2}-${strippedDate.padStart(2, "0")}`;
            dateInput.value = formattedDate;
            return;
        }
    }
};

dateInput.addEventListener("blur", (event) => {
    // Interpret the date
    interpretDate(event.target.value);
    // Then run the validator
    validateDate(event.target);
});
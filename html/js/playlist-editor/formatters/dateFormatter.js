"use strict";

const interpretDate = (date) => {
    date = date.replace(/\D/g, ""); // Only keep numbers
    date = date.slice(0, 8); // Only take the first 8 characters

    const num = (start, end) => {
        return date.slice(start, end);
    };

    const format = (year, month, day) => {
        // Cap month at 12
        if (parseInt(month) > 12) month = 12;
        // Cap day depending on the month
        const daysInMonth = new Date(year, month, 0).getDate();
        if (parseInt(day) > daysInMonth) day = daysInMonth;

        year = year.toString().padStart(4, "0");
        month = month.toString().padStart(2, "0");
        day = day.toString().padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    if (date.length === 8) {
        // Assume the date is in the format YYYYMMDD
        return format(num(0, 4), num(4, 6), num(6, 8));
    }

    if (date.length === 7) {
        // Assume the date is in the format YYYYMM0D
        return format(num(0, 4), num(4, 6), num(6, 8));
    }

    if (date.length === 6) {
        // Assume the date is in the format YYMMDD
        const year = new Date().getFullYear();
        
        return format(year, num(0, 2), num(2, 4));
    }

    if (date.length === 4) {
        // Assume the date is in the format MMDD
        const year = new Date().getFullYear();
        return format(year, num(0, 2), num(2, 4));
    }

    if (date.length === 3) {
        // Assume the date is in the format MDD or MM0D

        const firstTwoDigits = parseInt(num(0, 2));

        if (firstTwoDigits <= 12) {
            // Assume the date is in the format MM0D
            const year = new Date().getFullYear();
            return format(year, num(0, 2), num(2, 3));
        }
        else {
            // Assume the date is in the format MDD
            const year = new Date().getFullYear();
            return format(year, num(0, 1), num(1, 3));
        }
    }

    if (date.length === 2) {
        // Assume the date is in the format DD

        const currentDate = new Date().getDate();

        if (date >= currentDate) {
            // If it's in the future, assume it's this month
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;
            return format(year, month, date);
        }
        if (date < currentDate) {
            // If it's in the past, assume it's next month instead
            const newDate = new Date();
            newDate.setMonth(newDate.getMonth() + 1); // Handles rolling over to the next year

            const year = newDate.getFullYear();
            const month = newDate.getMonth() + 1;
            return format(year, month, date);
        }
    }

    if (date.length === 1) {
        // Assume the date is in the format 0D

        const currentDate = new Date().getDate();

        if (date >= currentDate) {
            // If it's in the future, assume it's this month
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;
            return format(year, month, num(0, 1));
        }
        if (date < currentDate) {
            // If it's in the past, assume it's next month instead
            const newDate = new Date();
            newDate.setMonth(newDate.getMonth() + 1); // Handles rolling over to the next year

            const year = newDate.getFullYear();
            const month = newDate.getMonth() + 1;
            return format(year, month, num(0, 1));
        }
    }

    // Fall back on returning the original date
    return date;
};
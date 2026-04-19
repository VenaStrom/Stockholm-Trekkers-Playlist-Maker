/** Non-regex non-digit stripper */
function onlyDigits(input: string): string {
  const allowedChars = "0123456789";
  let result = "";
  for (const char of input) {
    if (allowedChars.includes(char)) {
      result += char;
    }
  }
  return result;
}

function iso(year: string | number, month: string | number, day: string | number): string {
  return `${year.toString()}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

export function parseDate(unparsedDate: string): string {
  if (unparsedDate === "") return unparsedDate;

  const date = onlyDigits(unparsedDate);
  if (date === "") return unparsedDate;

  const thisYear: string = new Date().getFullYear().toString();
  const thisMonth: number = (new Date().getMonth() + 1);

  // Assume the date is in the format YYYYMMDD
  if (date.length === 8) {
    const month = Number(date.slice(4, 6));

    // If the month is valid, assume the date is in the format YYYYMMDD
    if (month >= 1 && month <= 12) {
      return iso(date.slice(0, 4), date.slice(4, 6), date.slice(6, 8));
    }

    // If the month is invalid, return as is
    return unparsedDate;
  }

  // Assume the date is in the format YYYYMM0D
  if (date.length === 7) {
    const month = Number(date.slice(4, 6));

    // If the month is valid, assume the date is in the format YYYYMM0D
    if (month >= 1 && month <= 12) {
      return iso(date.slice(0, 4), date.slice(4, 6), date.slice(6, 7));
    }

    // If the month is invalid, return as is
    return unparsedDate;
  }

  // Assume the date is in the format YYMMDD
  if (date.length === 6) {
    const month = Number(date.slice(2, 4));

    // If the month is valid, assume the date is in the format YYMMDD
    if (month >= 1 && month <= 12) {
      return iso(thisYear.slice(0, 2) + date.slice(0, 2), date.slice(2, 4), date.slice(4, 6));
    }

    // If the month is invalid, return as is
    return unparsedDate;
  }

  // Assume the date is in the format MMDD
  if (date.length === 4) {
    const month = Number(date.slice(0, 2));

    // If the month is valid, assume the date is in the format MMDD
    if (month >= 1 && month <= 12) {
      return iso(thisYear, date.slice(0, 2), date.slice(2, 4));
    }

    // If the month is invalid, return as is
    return unparsedDate;
  }

  // MM0D || MDD
  if (date.length === 3) {
    const firstTwoDigits = Number(date.slice(0, 2));

    // Assume the date is in the format MM0D
    if (firstTwoDigits <= 12) {
      return iso(thisYear, date.slice(0, 2), date.slice(2, 3));
    }

    // Assume the date is in the format MDD
    if (firstTwoDigits > 12) {
      return iso(thisYear, date.slice(0, 1), date.slice(1, 3));
    }
  }

  const day = Number(date);

  // Assume the date is in the format DD
  if (date.length === 2 && day >= 1 && day <= 31) {

    // If the date is today or in the future, assume it's this month
    if (day >= new Date().getDate()) {
      return iso(thisYear, thisMonth, date);
    }

    // If the day has passed, assume it's next month
    if (day < new Date().getDate()) {
      return iso(thisYear, thisMonth + 1, date);
    }
  }

  // Assume the date is in the format 0D
  if (date.length === 1 && day >= 1 && day <= 9) {

    // If the day hasn't passed, assume it's this month
    if (day >= new Date().getDate()) {
      return iso(thisYear, thisMonth, date);
    }

    // If the day has passed, assume it's next month
    if (day < new Date().getDate()) {
      return iso(thisYear, thisMonth + 1, date);
    }
  }

  // Return input if nothing catches.
  console.info("Date parser did not recognize the format of the input, returning it as is.", { input: unparsedDate });
  return unparsedDate;
}

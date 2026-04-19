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

export function parseDate(unparsedDate: string): string {
  if (unparsedDate === "") return unparsedDate;

  const strippedDate = onlyDigits(unparsedDate);
  if (strippedDate === "") return unparsedDate;

  // Assume the date is in the format YYYYMMDD
  if (strippedDate.length === 8) {
    return `${strippedDate.slice(0, 4)}-${strippedDate.slice(4, 6)}-${strippedDate.slice(6, 8)}`;
  }

  // Assume the date is in the format YYYYMM0D
  if (strippedDate.length === 7) {
    return `${strippedDate.slice(0, 4)}-${strippedDate.slice(4, 6)}-${strippedDate.slice(6, 7).padStart(2, "0")}`;
  }

  // Assume the date is in the format YYMMDD
  if (strippedDate.length === 6) {
    const currentCentury = new Date().getFullYear().toString().slice(0, 2);
    return `${currentCentury}${strippedDate.slice(0, 2)}-${strippedDate.slice(2, 4)}-${strippedDate.slice(4, 6)}`;
  }

  // Assume the date is in the format MMDD
  if (strippedDate.length === 4) {
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${strippedDate.slice(0, 2)}-${strippedDate.slice(2, 4)}`;
  }

  // MM0D || MDD
  if (strippedDate.length === 3) {
    const firstTwoDigits = Number(strippedDate.slice(0, 2));

    // Assume the date is in the format MM0D
    if (firstTwoDigits <= 12) {
      const currentYear = new Date().getFullYear();
      return `${currentYear}-${strippedDate.slice(0, 2).padStart(2, "0")}-${strippedDate.slice(2, 3).padStart(2, "0")}`;
    }

    // Assume the date is in the format MDD
    if (firstTwoDigits > 12) {
      const currentYear = new Date().getFullYear();
      return `${currentYear}-${strippedDate.slice(0, 1).padStart(2, "0")}-${strippedDate.slice(1, 3)}`;
    }
  }

  const day = Number(strippedDate);

  // Assume the date is in the format DD
  if (strippedDate.length === 2 && day >= 1 && day <= 31) {

    // If the date is today or in the future, assume it's this month
    if (day >= new Date().getDate()) {
      return `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${strippedDate}`;
    }

    // If the day has passed, assume it's next month
    if (day < new Date().getDate()) {
      return `${new Date().getFullYear()}-${new Date().getMonth() + 2}-${strippedDate}`;
    }
  }

  // Assume the date is in the format 0D
  if (strippedDate.length === 1 && day >= 1 && day <= 9) {

    // If the day hasn't passed, assume it's this month
    if (day >= new Date().getDate()) {
      return `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${strippedDate.padStart(2, "0")}`;
    }

    // If the day has passed, assume it's next month
    if (day < new Date().getDate()) {
      return `${new Date().getFullYear()}-${(new Date().getMonth() + 2).toString().padStart(2, "0")}-${strippedDate.padStart(2, "0")}`;
    }
  }

  // Return input if nothing catches.
  console.info("Date parser did not recognize the format of the input, returning it as is.", { input: unparsedDate });
  return unparsedDate;
}

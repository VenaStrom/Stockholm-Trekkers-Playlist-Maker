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

function mmss(minutes: string | number, seconds: string | number): string {
  minutes = minutes.toString().padStart(2, "0");
  seconds = seconds.toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function parseBlockTime(unparsedTime: string): string {
  if (!unparsedTime) return unparsedTime;

  const time = onlyDigits(unparsedTime);

  if (time.length > 4) return unparsedTime; // Too long to be a valid time, return as is

  function s(start: number, end: number): string {
    return time.slice(start, end);
  }

  // HH:MM
  if (time.length === 4) {
    return mmss(s(0, 2), s(2, 4));
  }

  // 0H:MM || HH:M0
  if (time.length === 3) {
    const firstTwoDigits = Number(s(0, 2));

    // HH:M0
    if (firstTwoDigits < 24) {
      return mmss(firstTwoDigits, s(2, 3) + "0");
    }

    // 0H:MM
    else {
      return mmss(s(0, 1), s(1, 3));
    }
  }

  // HH:00 || 0H:M0
  if (time.length === 2) {
    // HH:00
    if (Number(time) < 24) {
      return mmss(s(0, 2), 0);
    }

    // 0H:M0
    else {
      return mmss(s(0, 1), s(1, 2) + "0");
    }
  }

  // 0H:00
  if (time.length === 1) {
    // Assume format is 0H:00
    return mmss(s(0, 1), 0);
  }

  return unparsedTime;
}

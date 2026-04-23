
export function secondsToHHMMSS(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const hoursStr = hours > 0 ? String(hours).padStart(2, "0") + ":" : "";
  const minutesStr = String(minutes).padStart(2, "0") + ":";
  const secondsStr = String(seconds).padStart(2, "0");

  return hoursStr + minutesStr + secondsStr;
}

export function secondsToHHMM(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const hoursStr = hours > 0 ? String(hours).padStart(2, "0") + ":" : "";
  const minutesStr = String(minutes).padStart(2, "0");

  return hoursStr + minutesStr;
}

export function hhmmToSeconds(hhmm: string): number | null {
  const parts = hhmm.split(":").map(part => part.trim());
  if (parts.length !== 2) return null;

  const [hh, mm] = parts;
  const hours = Number(hh);
  const minutes = Number(mm);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || minutes < 0) return null;

  return hours * 3600 + minutes * 60;
}
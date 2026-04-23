
export function secondsToMMSS(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const hoursStr = hours > 0 ? String(hours).padStart(2, '0') + ':' : '';
  const minutesStr = String(minutes).padStart(2, '0') + ':';
  const secondsStr = String(seconds).padStart(2, '0');

  return hoursStr + minutesStr + secondsStr;
}

export function mmssToSeconds(mmss: string): number | null {
  const parts = mmss.split(':').map(part => part.trim());
  if (parts.length === 0 || parts.length > 2) return null;

  const [mm, ss] = parts;

  return (Number(mm) || 0) * 60 + (Number(ss) || 0);
}
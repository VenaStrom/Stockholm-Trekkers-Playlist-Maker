
export function secondsToTimeString(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const hoursStr = hours > 0 ? String(hours).padStart(2, '0') + ':' : '';
  const minutesStr = String(minutes).padStart(2, '0') + ':';
  const secondsStr = String(seconds).padStart(2, '0');

  return hoursStr + minutesStr + secondsStr;
}
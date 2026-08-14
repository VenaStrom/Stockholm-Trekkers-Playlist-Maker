import { hhmmToSeconds } from "@/functions/project/time-format";
import { DuplicateWarningScope } from "@/components/page-context";
import { Encoding, type Block, type Episode, type Project } from "@/types";

/**
 * Non-blocking sanity warnings for the project date input, in the spirit of v3.
 * Returns a warning to show the user, or null if the date looks fine.
 */
export function validateDate(dateStr: string): string | null {
  if (!dateStr.trim()) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return "Not a valid date.";

  const [, yearStr, monthStr, dayStr] = match;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const date = new Date(year, month - 1, day);
  // Date() rolls over out-of-range parts (e.g. month 13), so verify nothing moved
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return "Not a valid date.";
  }

  if (dateStr === "2063-04-05") return "Live long and prosper 🖖";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (date.getTime() === today.getTime()) return "Today. Are you sure?";
  if (date.getTime() < today.getTime()) return "In the past. Are you sure?";

  const weekday = date.getDay();
  if (weekday !== 0 && weekday !== 6) return "On a weekday. Are you sure?";

  if (year !== now.getFullYear()) return "Not the current year. Are you sure?";

  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  if (date.getTime() - today.getTime() > thirtyDaysMs) return "More than 1 month away. Are you sure?";

  return null;
}

/**
 * Non-blocking sanity warnings for a block's start time, in the spirit of v3:
 * format problems, duplicates, overlap with neighboring blocks, odd hours.
 * Returns a warning to show the user, or null if the time looks fine.
 */
export function validateBlockTime(block: Block, project: Project): string | null {
  const time = block.startTime;
  if (!time) {
    // A fresh block with no episodes shouldn't nag; warn once it has content
    const hasEpisodes = project.episodes.some(e => e.blockID === block.id && e.filePath);
    return hasEpisodes ? "Time is empty." : null;
  }
  if (!/^\d{1,2}:\d{2}$/.test(time)) return "Must be in format HH:MM.";

  const [hoursStr, minutesStr] = time.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (hours > 23 || minutes > 59) return "Invalid time.";

  const startSeconds = hhmmToSeconds(time);
  if (startSeconds === null) return "Invalid time.";

  // Duplicate start time in another block
  const isDuplicate = project.blocks.some(b => b.id !== block.id && b.startTime === time);
  if (isDuplicate) return "Duplicate time.";

  // Overlap with the neighboring blocks, when episode times have been computed
  const blockIndex = project.blocks.findIndex(b => b.id === block.id);
  const previousBlock = blockIndex > 0 ? project.blocks[blockIndex - 1] : undefined;
  const nextBlock = blockIndex < project.blocks.length - 1 ? project.blocks[blockIndex + 1] : undefined;

  if (previousBlock) {
    const previousEndSeconds = blockEndSeconds(previousBlock, project);
    if (previousEndSeconds !== null && previousEndSeconds > startSeconds) {
      return "Overlapping times with previous block.";
    }
  }
  if (nextBlock?.startTime) {
    const nextStartSeconds = hhmmToSeconds(nextBlock.startTime);
    const thisEndSeconds = blockEndSeconds(block, project);
    if (nextStartSeconds !== null && thisEndSeconds !== null && thisEndSeconds > nextStartSeconds) {
      return "Overlapping times with next block.";
    }
  }

  if (hours < 9) return "Very early. Are you sure?";
  if (hours > 20) return "Very late. Are you sure?";

  // Easter eggs take precedence over the odd-time warning
  if (minutes === 47) return "47!";
  if (time === "17:01") return "NCC-1701";
  if (minutes % 5 !== 0) return "Odd time. Are you sure?";

  return null;
}

/**
 * Non-blocking warning when the same media file is picked more than once,
 * scoped by the user's duplicate-warning setting.
 * Returns a warning to show the user, or null if the file is unique (or the setting is off).
 */
export function validateEpisodeFile(
  episode: Episode,
  project: Project,
  scope: DuplicateWarningScope,
): string | null {
  if (scope === DuplicateWarningScope.Off) return null;
  const filePath = episode.filePath?.trim();
  if (!filePath) return null;

  const twins = project.episodes.filter(e => e.id !== episode.id && e.filePath?.trim() === filePath);
  if (twins.length === 0) return null;

  const inSameBlock = twins.some(e => e.blockID === episode.blockID);
  if (inSameBlock) return "Same file twice in this block.";
  if (scope === DuplicateWarningScope.Project) return "Same file also in another block.";
  return null;
}

/** One line of the export-confirmation warning summary: what has the problem, and what it is */
export type ProjectWarning = { subject: string; message: string; };

/**
 * Every non-blocking warning the editor would show, labeled with where it comes from,
 * for the summary on the export confirmation. Deduplicated (twins of a duplicate file
 * produce the same line).
 */
export function collectProjectWarnings(
  project: Project,
  options: {
    duplicateScope: DuplicateWarningScope;
    /** Codec warnings are moot when the export re-encodes to H.264 anyway */
    includeCodecWarnings: boolean;
  },
): ProjectWarning[] {
  const warnings: ProjectWarning[] = [];

  const dateWarning = validateDate(project.date);
  if (dateWarning) warnings.push({ subject: "Date", message: dateWarning });

  project.blocks.forEach((block, index) => {
    const timeWarning = validateBlockTime(block, project);
    if (timeWarning) warnings.push({ subject: `Block ${index + 1}${block.startTime ? ` (${block.startTime})` : ""}`, message: timeWarning });
  });

  for (const episode of project.episodes) {
    const filePath = episode.filePath?.trim();
    if (!filePath) continue;
    const parts = filePath.split(/[/\\]/);
    const fileName = parts[parts.length - 1] || filePath;

    if (options.includeCodecWarnings && episode.cachedEncoding && episode.cachedEncoding !== Encoding.h264) {
      warnings.push({ subject: fileName, message: `${episode.cachedEncoding} is not H.264 and may stutter on the event computer.` });
    }

    const duplicateWarning = validateEpisodeFile(episode, project, options.duplicateScope);
    if (duplicateWarning) warnings.push({ subject: fileName, message: duplicateWarning });
  }

  const seen = new Set<string>();
  return warnings.filter((warning) => {
    const key = `${warning.subject}\n${warning.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** The computed end of a block's last timed episode, or null while times are unknown */
function blockEndSeconds(block: Block, project: Project): number | null {
  const episodes = project.episodes.filter(e => e.blockID === block.id);
  for (let i = episodes.length - 1; i >= 0; i--) {
    const end = episodes[i]?.cachedEndTime;
    if (end) return hhmmToSeconds(end);
  }
  return null;
}

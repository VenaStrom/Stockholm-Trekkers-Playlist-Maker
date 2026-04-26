import { hhmmToSeconds, secondsToHHMM } from "@/functions/project/time-format";
import type { BlockDefinedTime, Episode, Project } from "@/types";


export function compileTimeline(project: Project): Project {
  const blocks = project.blocks.filter((b): b is BlockDefinedTime => !!b.startTime);

  const blockEpisodesMap: Record<string, Episode[]> = {};

  for (const episode of project.episodes) {
    if (!episode.blockID) continue;

    blockEpisodesMap[episode.blockID] ??= [];
    blockEpisodesMap[episode.blockID]?.push(episode);
  }

  for (const block of blocks) {
    const episodesInBlock = blockEpisodesMap[block.id];
    if (!episodesInBlock) continue;

    if (episodesInBlock.some(e => !!e.filePath && !e.cachedDuration)) {
      console.warn(`Skipping block ${block.id} because at least one episode is missing duration`);
      continue;
    }

    const blockStartSeconds = hhmmToSeconds(block.startTime);
    if (!blockStartSeconds) {
      console.warn(`Invalid start time for block ${block.id}: ${block.startTime}`);
      for (const episode of episodesInBlock) {
        episode.cachedStartTime = undefined;
        episode.cachedEndTime = undefined;
      }
      continue;
    }

    let acc = blockStartSeconds;

    for (const episode of episodesInBlock) {
      if (!episode.cachedDuration) {
        console.warn(`Episode ${episode.id} is missing cachedDuration, skipping...`, { episode });
        continue;
      }

      episode.cachedStartTime = secondsToHHMM(acc);
      episode.cachedEndTime = secondsToHHMM(acc + episode.cachedDuration);
      acc += episode.cachedDuration;
    }
  }

  return project;
}

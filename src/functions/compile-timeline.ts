import { mmssToSeconds, secondsToMMSS } from "@/functions/project/time-format";
import type { Block, Episode, Project } from "@/types";

type BlockDefinedTime = Block & Required<Pick<Block, "startTime">>;

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

    if (episodesInBlock.some(e => !e.cachedDuration)) {
      console.warn(`Skipping block ${block.id} because at least one episode is missing duration`);
      continue;
    }

    const blockStartSeconds = mmssToSeconds(block.startTime);
    let acc = blockStartSeconds ?? 0;

    for (const episode of episodesInBlock) {
      if (!episode.cachedDuration) {
        console.warn(`Episode ${episode.id} is missing cachedDuration, skipping...`, { episode });
        continue;
      }

      episode.cachedStartTime = secondsToMMSS(acc);
      episode.cachedEndTime = secondsToMMSS(acc + episode.cachedDuration);
      acc += episode.cachedDuration;
    }
  }

  return project;
}

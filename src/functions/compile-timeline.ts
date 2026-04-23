import { mmssToSeconds, secondsToMMSS } from "@/functions/project/time-format";
import type { Block, Episode, Project } from "@/types";

type BlockDefinedTime = Block & Required<Pick<Block, "startTime">>;
type EpisodeTiming = Pick<Episode, "cachedStartTime" | "cachedEndTime">;

export function compileTimeline(project: Project): Project {
  const blocks = project.blocks.filter((b): b is BlockDefinedTime => !!b.startTime);

  const blockEpisodesMap = project.episodes.reduce<Record<string, Episode[]>>((acc, episode) => {
    if (!episode.blockID) return acc;

    const episodesInBlock = acc[episode.blockID] ?? [];
    return {
      ...acc,
      [episode.blockID]: [...episodesInBlock, episode],
    };
  }, {});

  const episodeTimings = blocks.reduce<Record<string, EpisodeTiming>>((acc, block) => {
    const episodesInBlock = blockEpisodesMap[block.id];
    if (!episodesInBlock || episodesInBlock.some(e => !e.cachedDuration)) return acc;

    const initialCursor = mmssToSeconds(block.startTime) ?? 0;
    const blockResult = episodesInBlock.reduce(
      (state, episode) => {
        const duration = episode.cachedDuration;
        if (!duration) return state;

        const nextCursor = state.cursor + duration;
        return {
          cursor: nextCursor,
          timings: {
            ...state.timings,
            [episode.id]: {
              cachedStartTime: secondsToMMSS(state.cursor),
              cachedEndTime: secondsToMMSS(nextCursor),
            },
          },
        };
      },
      { cursor: initialCursor, timings: {} as Record<string, EpisodeTiming> },
    );

    return {
      ...acc,
      ...blockResult.timings,
    };
  }, {});

  return {
    ...project,
    episodes: project.episodes.map(episode => {
      const timing = episodeTimings[episode.id];
      return timing ? { ...episode, ...timing } : episode;
    }),
  };
}

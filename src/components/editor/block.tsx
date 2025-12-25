import { useEffect, useMemo } from "react";
import { Block, Episode, Project } from "@/types";
import { IconDeleteOutline, IconSettingsOutline } from "../icons";
import EpisodeLi from "./episode";

export default function BlockLi({
  block,
  blockIndex,
  project: volatileProject,
  projectSetter: setVolatileProject,

}: {
  block: Block;
  blockIndex: number;
  project: Project;
  projectSetter: React.Dispatch<React.SetStateAction<Project | null>>;
}) {
  const episodes = useMemo(() => {
    // Build map of episodes belonging to this block
    const blockEpisodes = volatileProject.episodes.filter(e => e.blockId === block.id);
    const byId = new Map(blockEpisodes.map(e => [e.id, e]));

    // Find head: episode not referenced by any nextEpisodeId within the block
    const pointed = new Set(blockEpisodes.map(e => e.nextEpisodeId).filter(Boolean) as string[]);
    const heads = blockEpisodes.filter(e => !pointed.has(e.id));

    const ordered: Episode[] = [];
    for (const head of heads) {
      let cur: Episode | undefined = head;
      const seen = new Set<string>();
      while (cur && !seen.has(cur.id)) {
        ordered.push(cur);
        seen.add(cur.id);
        const nextId: string | undefined = cur.nextEpisodeId;
        cur = nextId ? byId.get(nextId) : undefined;
      }
    }

    // Append any orphaned episodes not reachable from heads
    for (const e of blockEpisodes) if (!ordered.find(x => x.id === e.id)) ordered.push(e);
    return ordered;
  }, [volatileProject.episodes, block.id]);

  // Ensure trailing empty episode
  useEffect(() => {
    // if (episodes.length === 0) return;

    // // Too few episodes
    // if (episodes.length <= 2) {
    //   const neededEpisodes = 2 - episodes.length;
    //   const newEpisodes: Episode[] = new Array(neededEpisodes).fill(null).map(() => getEmptyEpisode(block.id));

    //   setVolatileProject((prevProject) => {
    //     if (!prevProject) return prevProject;
    //     return { ...prevProject, episodes: [...prevProject.episodes, ...newEpisodes] };
    //   });
    //   return;
    // }

    // // Ensure last episode is empty
    // const lastEpisode = episodes.at(-1);
    // if (lastEpisode?.filePath) {
    //   const newEpisode = getEmptyEpisode(block.id);
    //   setVolatileProject((prevProject) => {
    //     if (!prevProject) return prevProject;
    //     return { ...prevProject, episodes: [...prevProject.episodes, newEpisode] };
    //   });
    //   return;
    // }

    // // Sort by order and block order
    // const sortedEpisodes = [...episodes].sort((a, b) => {
    //   if (a.order !== b.order) {
    //     return a.order - b.order;
    //   }
    //   const aBlock = volatileProject.blocks.find(b => b.id === a.id);
    //   const bBlock = volatileProject.blocks.find(b => b.id === b.id);
    //   if (typeof aBlock === "undefined" || typeof bBlock === "undefined") return 0;

    //   return aBlock.order - bBlock.order;
    // });
    // if (JSON.stringify(sortedEpisodes) !== JSON.stringify(episodes)) {
    //   setVolatileProject((prevProject) => {
    //     if (!prevProject) return prevProject;
    //     const otherEpisodes = prevProject.episodes.filter(e => e.blockId !== block.id);
    //     return { ...prevProject, episodes: [...otherEpisodes, ...sortedEpisodes] };
    //   });
    // }

  }, [block.id, episodes, setVolatileProject, volatileProject.blocks, volatileProject.episodes]);

  return (
    <li className="bg-abyss-800 px-4 py-2 rounded-sm">
      {/* Header */}
      <div className="h-14 flex flex-row items-center gap-x-4">
        <p>
          Block {blockIndex + 1}
        </p>

        <span className="flex-1"></span>

        {/* Controls */}
        <div className="flex flex-row gap-x-4">
          <button
            className="pe-1.5 ps-2.5 hover:bg-science-500 bg-abyss-200"
          >
            Block options
            <IconSettingsOutline className="inline size-6 ms-0.5" />
          </button>

          <button
            className="pe-1.5 ps-2.5 hover:bg-red-alert-500 bg-abyss-200"
          >
            Delete block
            <IconDeleteOutline className="inline size-6 ms-0.5" />
          </button>
        </div>
      </div>

      <hr className="h-0.5 opacity-50" />

      <div className="pt-3">
        <div className="flex flex-row gap-x-6 *:text-sm items-center ps-1">
          <span className="w-6"></span>
          <span className="w-[6ch]">Start</span>
          <span className="w-[7ch]">Duration</span>
        </div>
        <ul className="flex flex-col gap-y-2 pb-3 pt-1">
          {episodes.map(episode => (
            <EpisodeLi
              key={`episode-${episode.id}`}
              episode={episode}
              projectSetter={setVolatileProject}
            />
          ))}
        </ul>
      </div>
    </li>
  );
}
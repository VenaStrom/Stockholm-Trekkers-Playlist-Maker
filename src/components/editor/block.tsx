import { useEffect, useMemo } from "react";
import { Block, Episode, getEmptyEpisode, Project } from "../../project-types";
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
  const episodes = useMemo(() => volatileProject.episodes.filter(e => e.blockId === block.id), [volatileProject.episodes, block.id]);

  // Ensure trailing empty episode
  useEffect(() => {
    if (episodes.length === 0) return;

    setVolatileProject((prevProject) => {
      const newEpisodes: Episode[] = [];

      // Ensure minimum of 2 episodes
      if (episodes.length < 2) {
        const neededEpisodes = 2 - episodes.length;
        if (neededEpisodes > 0) {
          newEpisodes.push(...new Array(neededEpisodes).fill(null).map(() => getEmptyEpisode(block.id)));
        }
      }

      // Add trailing episode if the current last one has a filePath so one empty episode is always present
      const lastEpisode = episodes.at(-1);
      if (lastEpisode && lastEpisode.filePath) {
        newEpisodes.push(getEmptyEpisode(block.id));
      }

      // Ensure only one trailing empty episode
      const removableEpisodes: Episode["id"][] = [];
      for (const episode of [...episodes].reverse()) {
        if (episode && !episode.filePath) {
          removableEpisodes.push(episode.id);
        }
        else break;
      }
      removableEpisodes.shift(); // Remove last one to keep a single empty episode (to preserve id)
      if (removableEpisodes.length > 0 && episodes.length > 2) {
        newEpisodes.push(...volatileProject.episodes.filter(ep => !removableEpisodes.includes(ep.id)));
      }

      // Update state after collected changes
      if (newEpisodes.length > 0 && [...newEpisodes, ...episodes].length !== volatileProject.episodes.length) {
        if (!prevProject) return prevProject;
        const updatedEpisodes = [
          ...prevProject.episodes,
          ...newEpisodes,
        ];
        return { ...prevProject, episodes: updatedEpisodes };
      }
      return prevProject;
    });
  }, [block.id, episodes, setVolatileProject, volatileProject.episodes]);

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
              project={volatileProject}
              projectSetter={setVolatileProject}
            />
          ))}
        </ul>
      </div>
    </li>
  );
}
import { useEffect } from "react";
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

  // Handle episode count changes
  useEffect(() => {
    // Less than 2 episodes: add empty episodes
    if (block.episodes.length <= 2) {
      const neededEpisodes = 2 - block.episodes.length;
      if (neededEpisodes > 0) {
        // Add empty episodes to reach minimum count
        setVolatileProject((prevProject) => {
          if (!prevProject) return prevProject;

          const updatedBlocks = prevProject.blocks.map((b, idx) => {
            if (idx === blockIndex) {
              return {
                ...b,
                episodes: [
                  ...b.episodes,
                  ...Array.from({ length: neededEpisodes }, () => getEmptyEpisode()),
                ],
              };
            }
            return b;
          });

          return { ...prevProject, blocks: updatedBlocks };
        });
      }

      return;
    };

    // Ensure trailing empty episode
    const lastEpisode = block.episodes[block.episodes.length - 1];
    if (lastEpisode.filePath) {
      // Add an empty episode if the last one has a filePath
      setVolatileProject((prevProject) => {
        if (!prevProject) return prevProject;

        const updatedBlocks = prevProject.blocks.map((b, idx) => {
          if (idx === blockIndex) {
            return {
              ...b,
              episodes: [...b.episodes, getEmptyEpisode()],
            };
          }
          return b;
        });

        return { ...prevProject, blocks: updatedBlocks };
      });
    }

    // Ensure only one trailing empty episode
    const trailingEmptyEpisodes: Episode["id"][] = [];
    for (let i = block.episodes.length - 1; i >= 0; i--) {
      const episode = block.episodes[i];
      if (!episode.filePath) {
        trailingEmptyEpisodes.push(episode.id);
      }
      else {
        break;
      }
    }
    // Remove last one to keep a single empty episode (to keep id as well)
    trailingEmptyEpisodes.shift();
    if (trailingEmptyEpisodes.length > 0) {
      setVolatileProject((prevProject) => {
        if (!prevProject) return prevProject;

        const updatedBlocks = prevProject.blocks.map(b => {
          if (b.id === block.id) {
            const updatedEpisodes = b.episodes.filter(ep => !trailingEmptyEpisodes.includes(ep.id));
            return {
              ...b,
              episodes: updatedEpisodes,
            };
          }
          return b;
        });

        return { ...prevProject, blocks: updatedBlocks };
      });
    }
  }, [block.episodes]);

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
          {block.episodes.map(episode => (
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
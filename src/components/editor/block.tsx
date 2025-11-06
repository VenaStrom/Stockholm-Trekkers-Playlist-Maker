import { Block, Project } from "../../project-types";
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
        <span className="text-sm">
          Episodes
        </span>
        <ul className="flex flex-col gap-y-2 pb-3 pt-1">
          {block.episodes.map((episode, index) => (
            <EpisodeLi
              key={`episode-${episode.id}`}
              episode={episode}
              episodeIndex={index}
              project={volatileProject}
              projectSetter={setVolatileProject}
            />
          ))}
        </ul>
      </div>
    </li>
  );
}
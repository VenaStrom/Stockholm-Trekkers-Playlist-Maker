import { allOptionEntries } from "@/functions/block-options";
import type { Project } from "@/types";

/** Compact block/episode rundown, shared by project cards and the export confirmation */
export default function ProjectSummary({ project }: { project: Project; }) {
  if (project.blocks.length === 0) {
    return <p className="italic text-flare-700">No blocks</p>;
  }

  return (<>
    {project.blocks.map((block, blockIndex) => {
      const episodes = project.episodes.filter(e => e.blockID === block.id && e.filePath);
      const lastEpisode = episodes[episodes.length - 1];
      return (
        <div key={block.id} className={blockIndex > 0 ? "mt-1.5 pt-1.5 border-t border-abyss-200/30" : ""}>
          {/* Block header with mini option dots */}
          <p className="font-normal">
            Block {blockIndex + 1} - {block.startTime || "--:--"}
            <span className="inline-flex flex-row gap-x-0.5 ms-2 align-middle">
              {allOptionEntries().map(({ key, placement }) => (
                <span
                  key={key}
                  className={`
                    inline-block size-2 rounded-xs
                    ${block.options[key]
                      ? placement === "leading" ? "bg-science-500" : "bg-spore-500"
                      : "bg-abyss-500"}
                  `}
                ></span>
              ))}
            </span>
          </p>

          {/* Episodes */}
          {episodes.length === 0 ?
            <p className="italic text-flare-700">No episodes</p>
            :
            episodes.map((episode) => (
              <p key={episode.id} className="truncate text-flare-500/80">
                <span className="inline-block w-[6ch] text-flare-700">{episode.cachedStartTime || "--:--"}</span>
                {episode.filePath?.split(/[\\/]/).pop()}
              </p>
            ))
          }

          {/* Pause filler after the block */}
          <p className="italic text-flare-700">
            <span className="inline-block w-[6ch]">{lastEpisode?.cachedEndTime || "--:--"}</span>
            pause
          </p>
        </div>
      );
    })}
  </>);
}

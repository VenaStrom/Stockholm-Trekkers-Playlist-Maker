import { useEffect, useMemo, useRef, useState } from "react";
import type { Episode, Project } from "@/types";
import { IconDeleteOutline, IconDragIndicator, IconFolderOutline } from "@/components/icons";
import { open } from "@tauri-apps/plugin-dialog";
import { secondsToHHMMSS } from "@/functions/project/time-format";
import { generateID } from "@/functions/sha256";
import { probeEpisode } from "@/functions/project/episode-probe";

/** 
 * I don't like this, but this is very convenient to keep the UI prettier during drag-and-drop
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window { __st_drag?: string | null; }
}

export default function EpisodeLi({
  episode,
  project: volatileProject,
  projectSetter: setVolatileProject,
}: {
  episode: Episode;
  project: Project | null;
  projectSetter: React.Dispatch<React.SetStateAction<Project | null>>;
}) {
  const ffprobeRequestRef = useRef(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(episode.filePath ?? null);
  const previousEpisode = useMemo(() => {
    if (!volatileProject) return null;
    const episodesInBlock = volatileProject.episodes.filter(e => e.blockID === episode.blockID);
    const index = episodesInBlock.findIndex(e => e.id === episode.id);
    if (index === -1) return null;
    return episodesInBlock[index - 1] ?? null;
  }, [volatileProject, episode]);

  const normalizeEpisodes = (project: Project, episodes: Episode[]): Episode[] => {
    // Sort episodes so they are clumped by block id
    const sortedEpisodes: Episode[] = [];
    project.blocks.forEach(block => {
      const episodesInBlock = episodes.filter(e => e.blockID === block.id);
      sortedEpisodes.push(...episodesInBlock);
    });

    // Ensure each block has a trailing empty episode
    project.blocks.forEach(block => {
      const episodesInBlock = sortedEpisodes.filter(e => e.blockID === block.id);
      const lastWithPathIndex = [...episodesInBlock].reverse().findIndex(e => e.filePath && e.filePath.trim().length > 0);
      const trailingEmpties = lastWithPathIndex === -1
        ? episodesInBlock
        : episodesInBlock.filter((e, i) =>
          // All episodes after last with path that is empty
          i > episodesInBlock.length - 1 - lastWithPathIndex - 1
          && (!e.filePath || e.filePath.trim().length === 0),
        );
      // If no trailing empty, add one
      if (trailingEmpties.length === 0) {
        sortedEpisodes.push({ id: generateID(), blockID: block.id });
      }
      // Remove all but last trailing empty
      if (trailingEmpties.length > 1) {
        for (let i = 0; i < trailingEmpties.length - 1; i++) {
          const indexToRemove = sortedEpisodes.findIndex(e => e.id === trailingEmpties[i]?.id);
          if (indexToRemove !== -1) {
            sortedEpisodes.splice(indexToRemove, 1);
          }
        }
      }
    });

    return sortedEpisodes;
  };

  const updateProjectEpisodes = (
    project: Project,
    updater: (episodes: Episode[]) => Episode[],
  ): Project => {
    const nextEpisodes = updater(project.episodes.map(ep => ({ ...ep })));
    return { ...project, episodes: normalizeEpisodes(project, nextEpisodes) };
  };

  // Helper. Produces a new Project where the given episode has updated props and each block has exactly one trailing empty episode.
  const updateEpisode = (
    project: Project,
    episodeID: string,
    episodeProps: Partial<Omit<Episode, "id">>,
  ): Project => {
    return updateProjectEpisodes(project, (episodes) => {
      const epIndex = episodes.findIndex(ep => ep.id === episodeID);
      if (epIndex === -1) {
        console.warn(`[updateEpisode] Could not find episode with id ${episodeID}`);
        return episodes;
      }
      const targetEpisode = episodes[epIndex];
      if (!targetEpisode) return episodes;

      episodes[epIndex] = { ...targetEpisode, ...episodeProps };
      return episodes;
    });
  };

  // Sync on selected file
  useEffect(() => {
    setSelectedFile(episode.filePath || null);
  }, [episode.id, episode.filePath]);

  const fetchDurationForPath = (episodeID: string, filePath: string) => {
    const requestID = ++ffprobeRequestRef.current;

    probeEpisode({ ...episode, filePath })
      .then((probedEpisode) => {
        setVolatileProject(prev => {
          if (!prev) return prev;
          if (ffprobeRequestRef.current !== requestID) return prev;

          const targetEpisode = prev.episodes.find(ep => ep.id === episodeID);
          if (targetEpisode?.filePath !== filePath) return prev;

          return updateEpisode(prev, episodeID, probedEpisode);
        });
      })
      .catch((e: unknown) => {
        console.error("Error probing episode file:", e);
      });
  };

  const chooseFile = async () => {
    try {
      const filePath = await open({
        multiple: false,
        directory: false,
        filters: [
          { name: "Video Files", extensions: ["wav", "mp4", "mov", "avi", "mkv", "gif"] },
          { name: "Audio Files", extensions: ["mp3", "aac", "flac", "wav", "ogg", "m4a"] },
          { name: "Image Files", extensions: ["png", "jpg", "jpeg", "gif", "bmp", "tiff"] },
          { name: "All Files", extensions: ["*"] },
        ],
        title: "Select Episode Media File",
      });

      const fileString = typeof filePath === "string" ? filePath : null;
      setSelectedFile(fileString);

      setVolatileProject((prevProject) => {
        if (!prevProject) return prevProject;
        return updateEpisode(prevProject, episode.id, {
          filePath: fileString ?? undefined,
          cachedDuration: undefined, // Reset duration when file changes, will be re-populated on next metadata fetch
        });
      });

      if (fileString) {
        fetchDurationForPath(episode.id, fileString);
      }
    }
    catch (err) {
      console.error("Error during file selection:", err);
    }
  };

  const deleteEpisode = () => {
    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;
      return updateProjectEpisodes(prevProject, (episodes) => {
        return episodes.filter((ep) => ep.id !== episode.id);
      });
    });
  };

  // Drag/movement handlers
  const [isDragOver, setDragOver] = useState(false);
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", `episode:${episode.id}`);
    window.__st_drag = `episode:${episode.id}`; // To keep track of if moving a block or episode
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragEnd = () => {
    window.__st_drag = null;
    setDragOver(false);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedText: string = ((window.__st_drag ?? e.dataTransfer.getData("text/plain")) || "");
    if (!draggedText.startsWith("episode:")) {
      // Not an episode drag, ignore to avoid cross-highlighting
      setDragOver(false);
      return;
    }
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedText: string = ((window.__st_drag ?? e.dataTransfer.getData("text/plain")) || "");
    if (!draggedText.startsWith("episode:")) return;
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedText = (window.__st_drag ?? e.dataTransfer.getData("text/plain")) || "";
    if (!draggedText.startsWith("episode:")) return;

    setDragOver(false);

    const draggedID = draggedText.split(":")[1] ?? "";
    if (!draggedID || draggedID === episode.id) return;

    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;

      return updateProjectEpisodes(prevProject, (episodes) => {
        const draggedEpisodeIndex = episodes.findIndex(e => e.id === draggedID);
        const dropEpisodeIndex = episodes.findIndex(e => e.id === episode.id);
        if (draggedEpisodeIndex === -1 || dropEpisodeIndex === -1) {
          console.warn(`[EpisodeLi onDrop] Could not find episodes with ids ${draggedID} or ${episode.id}`);
          return episodes;
        }

        const draggedEpisode = episodes[draggedEpisodeIndex];
        const dropEpisode = episodes[dropEpisodeIndex];
        if (!draggedEpisode || !dropEpisode) {
          console.info(`Could not find episodes at indices ${draggedEpisodeIndex} or ${dropEpisodeIndex}`);
          return episodes;
        }

        const movedEpisode: Episode = { ...draggedEpisode, blockID: dropEpisode.blockID };
        const withoutDraggedEpisode = episodes.filter((_, index) => index !== draggedEpisodeIndex);
        const adjustedDropIndex = draggedEpisodeIndex < dropEpisodeIndex ? dropEpisodeIndex - 1 : dropEpisodeIndex;
        withoutDraggedEpisode.splice(adjustedDropIndex, 0, movedEpisode);
        return withoutDraggedEpisode;
      });
    });

    window.__st_drag = null;

    setTimeout(() => {
      const li = document.getElementById(`episode-${episode.id}`);
      if (!(li instanceof HTMLElement)) return;
      const thumb = li.querySelector(`[draggable="true"]`);
      const focusEl = thumb instanceof HTMLElement ? thumb : li;
      focusEl.tabIndex = 0;
      focusEl.focus();
      focusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };
  const moveEpisodeUpOne = () => {
    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;

      return updateProjectEpisodes(prevProject, (episodes) => {
        const thisIndex = episodes.findIndex(e => e.id === episode.id);
        if (thisIndex <= 0) return episodes; // Already at top

        const previousEpisode = episodes[thisIndex - 1];
        const thisEpisode = episodes[thisIndex];
        if (!previousEpisode || !thisEpisode) {
          console.info(`Could not find episodes at indices ${thisIndex} or ${thisIndex - 1}`);
          return episodes;
        }

        const nextEpisodes = [...episodes];

        // If moved block passed a blockID boundary, update blockIDs which will replace the move
        if (thisEpisode.blockID !== previousEpisode.blockID) {
          nextEpisodes[thisIndex] = { ...thisEpisode, blockID: previousEpisode.blockID };
        }
        else {
          // Swap positions when in same block
          nextEpisodes[thisIndex - 1] = { ...thisEpisode };
          nextEpisodes[thisIndex] = { ...previousEpisode };
        }

        return nextEpisodes;
      });
    });

    setTimeout(() => {
      const li = document.getElementById(`episode-${episode.id}`);
      if (!(li instanceof HTMLElement)) return;
      const thumb = li.querySelector(`[draggable="true"]`);
      const focusEl = thumb instanceof HTMLElement ? thumb : li;
      focusEl.tabIndex = 0;
      focusEl.focus();
      focusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };
  const moveEpisodeDownOne = () => {
    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;

      return updateProjectEpisodes(prevProject, (episodes) => {
        const thisIndex = episodes.findIndex(e => e.id === episode.id);
        if (thisIndex === -1 || thisIndex >= episodes.length - 1) return episodes; // Already at bottom

        const thisEpisode = episodes[thisIndex];
        const nextEpisode = episodes[thisIndex + 1];
        if (!thisEpisode || !nextEpisode) {
          console.info(`Could not find episodes at indices ${thisIndex} or ${thisIndex + 1}`);
          return episodes;
        }
        const nextNextEpisode = episodes[thisIndex + 2];
        const nextEpisodes = [...episodes];

        // Special case: moving down from end of block to start of next block
        if (
          nextNextEpisode
          && thisEpisode.blockID === nextEpisode.blockID // On the same block as the edge piece
          && (typeof nextEpisode.filePath === "undefined" || nextEpisode.filePath.trim().length === 0) // Edge piece is empty
          && thisEpisode.blockID !== nextNextEpisode.blockID // Third piece is in next block, don't care if it's empty or not
        ) {
          // Get next block id
          nextEpisodes[thisIndex] = { ...nextEpisode };
          nextEpisodes[thisIndex + 1] = { ...thisEpisode, blockID: nextNextEpisode.blockID };
        }
        // Only change block when passing a blockID boundary
        else if (thisEpisode.blockID !== nextEpisode.blockID) {
          nextEpisodes[thisIndex] = { ...thisEpisode, blockID: nextEpisode.blockID };
        }
        // Swap positions when in same block
        else {
          nextEpisodes[thisIndex + 1] = { ...thisEpisode };
          nextEpisodes[thisIndex] = { ...nextEpisode };
        }

        return nextEpisodes;
      });
    });

    setTimeout(() => {
      const li = document.getElementById(`episode-${episode.id}`);
      if (!(li instanceof HTMLElement)) return;
      const thumb = li.querySelector(`[draggable="true"]`);
      const focusEl = thumb instanceof HTMLElement ? thumb : li;
      focusEl.tabIndex = 0;
      focusEl.focus();
      focusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  // Memoized file name and route for prettier display :3
  const prettyFilePathParts = useMemo<{ fileName: string, fileRoute: string, delim: string } | null>(() => {
    if (!selectedFile) return null;

    const delim = selectedFile.includes("/") ? "/" : "\\";
    const parts = selectedFile.split(/[/\\]/);
    const fileName = parts[parts.length - 1];
    if (!fileName) return null;

    parts.pop();
    const fileRoute = parts.join(delim);

    return { fileName, fileRoute, delim };
  }, [selectedFile]);

  const isLastAndEmptyInBlock = useMemo(() => {
    if (!volatileProject) return false;
    const episodesInBlock = volatileProject.episodes
      .filter(e => e.blockID === episode.blockID)
      .filter(e => !e.filePath?.trim().length);
    if (episodesInBlock.length === 0) return false;
    return episodesInBlock[episodesInBlock.length - 1]?.id === episode.id;
  }, [volatileProject, episode]);

  return (
    <li
      id={`episode-${episode.id}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      className={`w-full flex flex-row items-center ps-1 select-none min-w-0 ${isDragOver
        ? "ring-2 ring-science-500/60 rounded-sm"
        : ""}`
      }
    >
      {/* Delete and info */}
      <div className="flex flex-row gap-x-6 items-center pe-10">
        {/* Delete button */}
        <button
          className={`€icon text-flare-700 hover:text-red-alert-500 ${isLastAndEmptyInBlock ? "opacity-0 cursor-[inherit]" : ""}`}
          onClick={isLastAndEmptyInBlock ? undefined : deleteEpisode}
          aria-hidden={isLastAndEmptyInBlock}
        >
          <IconDeleteOutline className="size-6" />
        </button>

        {/* Start time */}
        <span className={`w-[5ch] ${!episode.cachedStartTime ? "text-flare-700" : ""}`}>{episode.cachedStartTime || previousEpisode?.cachedEndTime || "--:--"}</span>

        {/* Duration */}
        <span className={`w-[7ch] ps-0.5 text-flare-700`}>{episode.cachedDuration ? secondsToHHMMSS(episode.cachedDuration) : "-"}</span>

        {/* Encoding */}
        <span className={`w-[4ch] text-flare-700`}>{episode.cachedEncoding ? episode.cachedEncoding : "-"}</span>
      </div>

      {/* Custom file input */}
      <label className="bg-abyss-500 rounded-sm flex flow-row items-center justify-between gap-x-4 ps-3 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <span style={{ direction: "rtl" }} className="block overflow-hidden text-start min-w-0">
            <span style={{ direction: "ltr" }} className={`truncate inline-block align-middle ${selectedFile ? "" : "text-flare-700"}`}>
              {(selectedFile && prettyFilePathParts) ?
                // TODO fix truncation instead of this
                // <><span className="text-flare-700">{prettyFilePathParts.fileRoute}{prettyFilePathParts.delim}</span>{prettyFilePathParts.fileName}</>
                <><span className="text-flare-700"></span>{prettyFilePathParts.fileName}</>
                : "No file selected"}
            </span>
          </span>
        </div>

        <button
          className="bg-abyss-200 hover:bg-spore-500 ps-3"
          onClick={() => {
            void chooseFile();
          }}
        >
          Select file
          <IconFolderOutline className="inline size-6 ms-0.5" />
        </button>
      </label>

      {/* Drag thumb */}
      <span
        draggable
        className={`cursor-grab ms-3 text-flare-700 hover:opacity-80 transition-all`}
        aria-label="Drag to reorder"
        title="Drag to reorder"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            moveEpisodeUpOne();
          }
          else if (e.key === "ArrowDown") {
            e.preventDefault();
            moveEpisodeDownOne();
          }
        }}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <IconDragIndicator className="size-6" />
      </span>
    </li>
  );
}
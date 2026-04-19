import { useEffect, useMemo, useState } from "react";
import type { Episode, Project } from "@/types";
import { IconDeleteOutline, IconDragIndicator, IconFolderOutline } from "@/components/icons";
import { open } from "@tauri-apps/plugin-dialog";
import { secondsToTimeString } from "@/functions/time-format";
import { generateID } from "@/functions/sha256";
import { runFFprobe } from "@/functions/ffmpeg";

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
  const [selectedFile, setSelectedFile] = useState<string | null>(episode.filePath ?? null);

  // Helper. Produces a new Project where the given episode has its filePath set, and ensure each block has a trailing empty episode
  const updateEpisode = (project: Project, episodeID: string, episodeProps: Partial<Omit<Episode, "id">>): Project => {
    const updatedEpisodes = JSON.parse(JSON.stringify(project.episodes)) as Episode[];
    const epIndex = updatedEpisodes.findIndex(ep => ep.id === episodeID);
    if (epIndex === -1) {
      console.warn(`[updateEpisode] Could not find episode with id ${episodeID}`);
      return project;
    }
    if (!updatedEpisodes[epIndex]) throw new Error("Episode to update is undefined");
    updatedEpisodes[epIndex] = { ...updatedEpisodes[epIndex], ...episodeProps };

    // Sort episodes so they are clumped by block id
    const sortedEpisodes: Episode[] = [];
    project.blocks.forEach(block => {
      const episodesInBlock = updatedEpisodes.filter(e => e.blockID === block.id);
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

    return { ...project, episodes: sortedEpisodes };
  };

  const chooseFile = () => {
    if (episode.filePath) {
      runFFprobe([
        // Get duration of file for metadata display and sorting
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        episode.filePath,
      ])
        .then((o) => {
          const durationSeconds = parseFloat(o.stdout);
          if (isNaN(durationSeconds)) {
            console.warn(`Could not parse duration from ffprobe output: ${o.stdout}`);
            return;
          }

          setVolatileProject((prevProject) => {
            if (!prevProject) return prevProject;
            return updateEpisode(prevProject, episode.id, { duration: durationSeconds });
          });
        })
        .catch((e: unknown) => {
          console.error("Error running FFprobe command:", e);
        });
    }

    (async () => {
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
            duration: undefined, // Reset duration when file changes, will be re-populated on next metadata fetch
          });
        });
      }
      catch (err) {
        console.error("Error during file selection:", err);
      }
    })()
      .catch((err: unknown) => {
        console.error("Error in chooseFile async function:", err);
      });
  };

  const deleteEpisode = () => {
    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;
      const newEpisodes = prevProject.episodes.filter((ep) => ep.id !== episode.id);
      return { ...prevProject, episodes: newEpisodes };
    });
  };

  // Update project state on selectedFile change
  useEffect(() => {
    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;
      return updateEpisode(prevProject, episode.id, {
        filePath: selectedFile ?? undefined,
        duration: undefined, // Reset duration when file changes, will be re-populated on next metadata fetch
      });
    });
  }, [episode.id, selectedFile, setVolatileProject]);

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

    if (!volatileProject) return;
    const episodesCopy = [...volatileProject.episodes];
    const draggedEpisodeIndex = episodesCopy.findIndex(e => e.id === draggedID);
    const dropEpisodeIndex = episodesCopy.findIndex(e => e.id === episode.id);
    if (draggedEpisodeIndex === -1 || dropEpisodeIndex === -1) {
      console.warn(`[EpisodeLi onDrop] Could not find episodes with ids ${draggedID} or ${episode.id}`);
      return;
    }

    const draggedEpisode = episodesCopy[draggedEpisodeIndex];
    const dropEpisode = episodesCopy[dropEpisodeIndex];
    if (!draggedEpisode || !dropEpisode) {
      console.info(`Could not find episodes at indices ${draggedEpisodeIndex} or ${dropEpisodeIndex}`);
      return;
    }

    // Insert before and copy blockID of drop target onto dragged episode
    episodesCopy.splice(draggedEpisodeIndex, 1);
    draggedEpisode.blockID = dropEpisode.blockID;
    episodesCopy.splice(dropEpisodeIndex, 0, draggedEpisode);

    setVolatileProject(prev => prev ? { ...prev, episodes: episodesCopy } : prev);

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
    if (!volatileProject) return;

    const episodesCopy = [...volatileProject.episodes];
    const thisIndex = episodesCopy.findIndex(e => e.id === episode.id);
    if (thisIndex <= 0) return; // Already at top

    const previousEpisode = episodesCopy[thisIndex - 1];
    const thisEpisode = episodesCopy[thisIndex];
    if (!previousEpisode || !thisEpisode) {
      console.info(`Could not find episodes at indices ${thisIndex} or ${thisIndex - 1}`);
      return;
    }

    // If moved block passed a blockID boundary, update blockIDs which will replace the move
    if (thisEpisode.blockID !== previousEpisode.blockID) {
      if (!episodesCopy[thisIndex]) {
        throw new Error("Episode at thisIndex is undefined after blockID change, this should never happen");
      }
      episodesCopy[thisIndex].blockID = previousEpisode.blockID;
    }
    else {
      // Swap positions when in same block
      episodesCopy[thisIndex - 1] = { ...thisEpisode };
      episodesCopy[thisIndex] = { ...previousEpisode };
    }

    setVolatileProject(prev => prev ? { ...prev, episodes: episodesCopy } : prev);

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
    if (!volatileProject) return;

    const episodesCopy = [...volatileProject.episodes];
    const thisIndex = episodesCopy.findIndex(e => e.id === episode.id);
    if (thisIndex === -1 || thisIndex >= episodesCopy.length - 1) return; // Already at bottom

    const thisEpisode = episodesCopy[thisIndex];
    const nextEpisode = episodesCopy[thisIndex + 1];
    if (!thisEpisode || !nextEpisode) {
      console.info(`Could not find episodes at indices ${thisIndex} or ${thisIndex + 1}`);
      return;
    }
    const nextNextEpisode = episodesCopy[thisIndex + 2];

    // Special case: moving down from end of block to start of next block
    if (
      nextNextEpisode
      && thisEpisode.blockID === nextEpisode.blockID // On the same block as the edge piece
      && (typeof nextEpisode.filePath === "undefined" || nextEpisode.filePath.trim().length === 0) // Edge piece is empty
      && thisEpisode.blockID !== nextNextEpisode.blockID // Third piece is in next block, don't care if it's empty or not
    ) {
      if (!episodesCopy[thisIndex]) {
        throw new Error("Episode at thisIndex is undefined after blockID change, this should never happen");
      }
      // Get next block id
      episodesCopy[thisIndex].blockID = nextNextEpisode.blockID;
      // Swap with next episode to maintain order
      episodesCopy[thisIndex + 1] = { ...thisEpisode };
      episodesCopy[thisIndex] = { ...nextEpisode };
    }
    // Only change block when passing a blockID boundary
    else if (thisEpisode.blockID !== nextEpisode.blockID) {
      if (!episodesCopy[thisIndex]) {
        throw new Error("Episode at thisIndex is undefined after blockID change, this should never happen");
      }
      episodesCopy[thisIndex].blockID = nextEpisode.blockID;
    }
    // Swap positions when in same block
    else {
      episodesCopy[thisIndex + 1] = { ...thisEpisode };
      episodesCopy[thisIndex] = { ...nextEpisode };
    }

    setVolatileProject(prev => prev ? { ...prev, episodes: episodesCopy } : prev);

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
        <span className={`w-[5ch] ${!episode.cachedStartTime ? "text-flare-700" : ""}`}>{episode.cachedStartTime || "--:--"}</span>
        {/* Duration */}
        <span className={`w-[7ch] ps-0.5 ${!episode.duration ? "text-flare-700" : ""}`}>{episode.duration ? secondsToTimeString(episode.duration) : "-"}</span>
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
          onClick={chooseFile}
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
import { useMemo, useState } from "react";
import { Episode, Project } from "../../project-types";
import { IconDeleteOutline, IconDragIndicator, IconFolderOutline } from "../icons";
import { open } from "@tauri-apps/plugin-dialog";
import { secondsToTimeString } from "../../functions/time-format";

export default function EpisodeLi({
  episode,
  project: volatileProject,
  projectSetter: setVolatileProject,

}: {
  episode: Episode;
  project: Project;
  projectSetter: React.Dispatch<React.SetStateAction<Project | null>>;
}) {
  const [selectedFile, setSelectedFile] = useState<string | null>(volatileProject.blocks.find(block =>
    block.episodes.some(ep => ep.id === episode.id))?.episodes.find(ep => ep.id === episode.id)?.filePath || null);

  const onFileChange = async () => {
    const filePath = await open({
      multiple: false,
      filters: [
        { name: "Video Files", extensions: ["wav", "mp4", "mov", "avi", "mkv", "gif"], },
        { name: "Audio Files", extensions: ["mp3", "aac", "flac", "wav", "ogg", "m4a"], },
        { name: "Image Files", extensions: ["png", "jpg", "jpeg", "gif", "bmp", "tiff"], },
        { name: "All Files", extensions: ["*"] },
      ],
      title: "Select Episode Media File",
    });

    if (!filePath || typeof filePath !== "string") {
      console.warn("Canceled file selection");
      // Unset selected file if selection was canceled
      setSelectedFile(null);
    }
    else {
      setSelectedFile(filePath);
    }

    const newEpisode: Episode = {
      ...episode,
      filePath: filePath,
    };

    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;

      const updatedBlocks = prevProject.blocks.map((block) => {
        const updatedEpisodes = block.episodes.map((ep) => {
          if (ep.id === newEpisode.id) {
            return { ...newEpisode };
          }
          return ep;
        });
        return { ...block, episodes: updatedEpisodes };
      });

      return { ...prevProject, blocks: updatedBlocks };
    });
  };

  // Drag handlers
  const [isDragOver, setDragOver] = useState(false);
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", episode.id);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => {
    setDragOver(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    setDragOver(false);
    if (!draggedId || draggedId === episode.id) return;

    setVolatileProject((prev) => {
      if (!prev) return prev;

      const sourceBlockIndex = prev.blocks.findIndex(b => b.episodes.some(ep => ep.id === draggedId));
      const targetBlockIndex = prev.blocks.findIndex(b => b.episodes.some(ep => ep.id === episode.id));
      if (sourceBlockIndex === -1 || targetBlockIndex === -1) return prev;

      const sourceBlock = prev.blocks[sourceBlockIndex];
      const targetBlock = prev.blocks[targetBlockIndex];

      const draggedEpisodeIndex = sourceBlock.episodes.findIndex(ep => ep.id === draggedId);
      const targetEpisodeIndex = targetBlock.episodes.findIndex(ep => ep.id === episode.id);
      if (draggedEpisodeIndex === -1 || targetEpisodeIndex === -1) return prev;

      const draggedEpisode = sourceBlock.episodes[draggedEpisodeIndex];

      // Move within same block
      if (sourceBlockIndex === targetBlockIndex) {
        const arr = [...sourceBlock.episodes];
        arr.splice(draggedEpisodeIndex, 1);        // remove original
        const insertIndex = draggedEpisodeIndex < targetEpisodeIndex ? targetEpisodeIndex : targetEpisodeIndex;
        arr.splice(insertIndex, 0, draggedEpisode);
        const newBlocks = prev.blocks.map((b, idx) => idx === sourceBlockIndex ? { ...b, episodes: arr } : b);
        return { ...prev, blocks: newBlocks };
      }

      // Move across blocks
      const newBlocks = prev.blocks.map((b, idx) => {
        if (idx === sourceBlockIndex) {
          const arr = [...b.episodes];
          arr.splice(draggedEpisodeIndex, 1);
          return { ...b, episodes: arr };
        }
        if (idx === targetBlockIndex) {
          const arr = [...b.episodes];
          arr.splice(targetEpisodeIndex, 0, draggedEpisode);
          return { ...b, episodes: arr };
        }
        return b;
      });

      return { ...prev, blocks: newBlocks };
    });
  };

  const moveEpisodeUpOne = () => {
    const blockIndex = volatileProject.blocks.findIndex(b => b.episodes.some(ep => ep.id === episode.id));
    if (blockIndex === -1) return;

    const block = volatileProject.blocks[blockIndex];
    const episodeIndex = block.episodes.findIndex(ep => ep.id === episode.id);
    if (episodeIndex === -1) return;

    // Move up within the same block
    if (episodeIndex > 0) {
      setVolatileProject((prevProject) => {
        if (!prevProject) return prevProject;

        const updatedBlocks = prevProject.blocks.map((b, idx) => {
          if (idx === blockIndex) {
            const arr = [...b.episodes];
            const [movedEpisode] = arr.splice(episodeIndex, 1);
            arr.splice(episodeIndex - 1, 0, movedEpisode);
            return {
              ...b,
              episodes: arr,
            };
          }
          return b;
        });

        return { ...prevProject, blocks: updatedBlocks };
      });
    }
    // Move to end of previous block
    else if (blockIndex > 0) {
      setVolatileProject((prevProject) => {
        if (!prevProject) return prevProject;

        const updatedBlocks = prevProject.blocks.map((b, idx) => {
          // Remove from current block
          if (idx === blockIndex) {
            const arr = [...b.episodes];
            arr.splice(episodeIndex, 1);
            return {
              ...b,
              episodes: arr,
            };
          }
          // Add to end of previous block
          else if (idx === blockIndex - 1) {
            return {
              ...b,
              episodes: [...b.episodes, episode],
            };
          }
          return b;
        });

        return { ...prevProject, blocks: updatedBlocks };
      });
    }

    return;
  };

  const moveEpisodeDownOne = () => {
    const blockIndex = volatileProject.blocks.findIndex(b => b.episodes.some(ep => ep.id === episode.id));
    if (blockIndex === -1) return;

    const block = volatileProject.blocks[blockIndex];
    const episodeIndex = block.episodes.findIndex(ep => ep.id === episode.id);
    if (episodeIndex === -1) return;

    // Move down within the same block
    if (episodeIndex < block.episodes.length - 1) {
      setVolatileProject((prevProject) => {
        if (!prevProject) return prevProject;

        const updatedBlocks = prevProject.blocks.map((b, idx) => {
          if (idx === blockIndex) {
            const arr = [...b.episodes];
            const [movedEpisode] = arr.splice(episodeIndex, 1);
            arr.splice(episodeIndex + 1, 0, movedEpisode);
            return {
              ...b,
              episodes: arr,
            };
          }
          return b;
        });

        return { ...prevProject, blocks: updatedBlocks };
      });
    }
    // Move to start of next block
    else if (blockIndex < volatileProject.blocks.length - 1) {
      setVolatileProject((prevProject) => {
        if (!prevProject) return prevProject;

        const updatedBlocks = prevProject.blocks.map((b, idx) => {
          // Remove from current block
          if (idx === blockIndex) {
            const arr = [...b.episodes];
            arr.splice(episodeIndex, 1);
            return {
              ...b,
              episodes: arr,
            };
          }
          // Add to start of next block
          else if (idx === blockIndex + 1) {
            return {
              ...b,
              episodes: [episode, ...b.episodes],
            };
          }
          return b;
        });

        return { ...prevProject, blocks: updatedBlocks };
      });
    }

    return;
  };

  // Memoized file name and route for prettier display
  const fileName = useMemo(() => {
    if (!selectedFile) return "No file selected";
    const parts = selectedFile.split(/[/\\]/);
    return parts[parts.length - 1];
  }, [selectedFile]);
  const fileRoute = useMemo(() => {
    if (!selectedFile) return "No file selected";

    // remove file name from path
    const delim = selectedFile.includes("/") ? "/" : "\\";
    const parts = selectedFile.split(/[/\\]/);
    parts.pop();
    return parts.join(delim);

  }, [selectedFile]);
  const delim = useMemo(() => {
    if (!selectedFile) return "/";
    return selectedFile.includes("/") ? "/" : "\\";
  }, [selectedFile]);

  return (
    <li
      className={`w-full flex flex-row items-center ps-1 select-none ${isDragOver ? "ring-2 ring-science-500/60 rounded-sm" : ""}`}
      id={`episode-${episode.id}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
    >
      <div className="flex flex-row gap-x-6 items-center pe-10">
        {/* Delete button */}
        <button className="€icon">
          <IconDeleteOutline className="size-6 text-flare-700/95" />
        </button>
        {/* Start time */}
        <span className={`w-[5ch] ${!episode.cachedStartTime ? "text-flare-700" : ""}`}>{episode.cachedStartTime || "--:--"}</span>
        {/* Duration */}
        <span className={`w-[7ch] ps-0.5 ${!episode.duration ? "text-flare-700" : ""}`}>{episode.duration ? secondsToTimeString(episode.duration) : "-"}</span>
      </div>

      {/* Custom file input */}
      <label className="bg-abyss-500 rounded-sm flex flow-row items-center justify-between gap-x-4 ps-3 flex-1">
        <div className="flex-1 min-w-0">
          <span style={{ direction: "rtl" }} className="block overflow-hidden text-start">
            <span style={{ direction: "ltr" }} className={`truncate inline-block align-middle ${selectedFile ? "" : "text-flare-700"}`}>
              {selectedFile ?
                <><span className="text-flare-700">{fileRoute}{delim}</span>{fileName}</>
                : "No file selected"}
            </span>
          </span>
        </div>

        <button
          className="bg-abyss-200 hover:bg-spore-500 ps-3"
          onClick={onFileChange}
        >
          Select file
          <IconFolderOutline className="inline size-6 ms-0.5" />
        </button>
      </label>

      {/* Drag thumb */}
      <span
        draggable
        onDragStart={onDragStart}
        className={`cursor-grab ms-3 text-flare-700/95 hover:opacity-80 transition-all`}
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
      >
        <IconDragIndicator className="size-6" />
      </span>
    </li>
  );
}
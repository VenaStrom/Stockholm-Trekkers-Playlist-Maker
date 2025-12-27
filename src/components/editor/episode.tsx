import { useEffect, useMemo, useState } from "react";
import { Episode, Project } from "@/types";
import { IconDeleteOutline, IconDragIndicator, IconFolderOutline } from "../icons";
import { open } from "@tauri-apps/plugin-dialog";
import { secondsToTimeString } from "../../functions/time-format";

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

  const chooseFile = () => {
    const handleFileSelection = async () => {
      const filePath = await open({
        multiple: false,
        directory: false,
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
        filePath: filePath ?? undefined,
      };

      setVolatileProject((prevProject) => {
        if (!prevProject) return prevProject;
        const newEpisodes = prevProject.episodes.map((ep) => ep.id === newEpisode.id ? newEpisode : ep);
        return { ...prevProject, episodes: newEpisodes };
      });
    };

    handleFileSelection()
      .catch((err) => {
        console.error("Error during file selection:", err);
      });
  };

  const deleteEpisode = () => {
    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;
      const newEpisodes = prevProject.episodes.filter((ep) => ep.id !== episode.id);
      return { ...prevProject, episodes: newEpisodes };
    });
  };

  // Update project on selectedFile change
  useEffect(() => {
    const newEpisode: Episode = {
      ...episode,
      filePath: selectedFile ?? undefined,
    };

    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;
      const newEpisodes = prevProject.episodes.map((ep) => ep.id === newEpisode.id ? newEpisode : ep);
      return { ...prevProject, episodes: newEpisodes };
    });
  }, [episode, selectedFile, setVolatileProject]);

  // Drag handlers
  const [isDragOver, setDragOver] = useState(false);
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", episode.id);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
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

    if (!volatileProject) return;

    const episodesCopy = [...volatileProject.episodes]
    const draggedEpisodeIndex = episodesCopy.findIndex(e => e.id === draggedId);
    const dropEpisodeIndex = episodesCopy.findIndex(e => e.id === episode.id);
    if (draggedEpisodeIndex === -1 || dropEpisodeIndex === -1) {
      console.info(`Could not find episodes with ids ${draggedId} or ${episode.id}`);
      return;
    }

    const draggedEpisode = episodesCopy[draggedEpisodeIndex];
    const dropEpisode = episodesCopy[dropEpisodeIndex];
    if (!draggedEpisode || !dropEpisode) {
      console.info(`Could not find episodes at indices ${draggedEpisodeIndex} or ${dropEpisodeIndex}`);
      return;
    }

    // Insert before and copy blockId of drop target onto dragged episode
    episodesCopy.splice(draggedEpisodeIndex, 1);
    draggedEpisode.blockId = dropEpisode.blockId;
    episodesCopy.splice(dropEpisodeIndex, 0, draggedEpisode);

    setVolatileProject({
      ...volatileProject,
      episodes: episodesCopy,
    });

    // Keep moved episode in view / focused
    setTimeout(() => {
      const li = document.getElementById(`episode-${episode.id}`);
      if (!(li instanceof HTMLElement)) return;
      const thumb = li.querySelector('[draggable="true"]');
      const focusEl = thumb instanceof HTMLElement ? thumb : li;
      focusEl.tabIndex = 0;
      focusEl.focus();
      focusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const moveEpisodeUpOne = () => {
    if (!volatileProject) return;

    const episodesCopy = [...volatileProject.episodes]
    const thisIndex = episodesCopy.findIndex(e => e.id === episode.id);
    if (thisIndex <= 0) return; // Already at top

    const previousEpisode = episodesCopy[thisIndex - 1];
    const thisEpisode = episodesCopy[thisIndex];
    if (!previousEpisode || !thisEpisode) {
      console.info(`Could not find episodes at indices ${thisIndex} or ${thisIndex - 1}`);
      return;
    }

    // If moved block passed a blockId boundary, update blockIds which will replace the move
    if (thisEpisode.blockId !== previousEpisode.blockId) {
      episodesCopy[thisIndex]!.blockId = previousEpisode.blockId;
    }
    else {
      // Swap positions when in same block
      episodesCopy[thisIndex - 1] = { ...thisEpisode };
      episodesCopy[thisIndex] = { ...previousEpisode };
    }

    setVolatileProject({
      ...volatileProject,
      episodes: episodesCopy,
    });

    // Keep moved episode in view / focused
    setTimeout(() => {
      const li = document.getElementById(`episode-${episode.id}`);
      if (!(li instanceof HTMLElement)) return;
      const thumb = li.querySelector('[draggable="true"]');
      const focusEl = thumb instanceof HTMLElement ? thumb : li;
      focusEl.tabIndex = 0;
      focusEl.focus();
      focusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };
  const moveEpisodeDownOne = () => {
    if (!volatileProject) return;

    const episodesCopy = [...volatileProject.episodes]
    const thisIndex = episodesCopy.findIndex(e => e.id === episode.id);
    if (thisIndex === -1 || thisIndex >= episodesCopy.length - 1) return; // Already at bottom

    const nextEpisode = episodesCopy[thisIndex + 1];
    const thisEpisode = episodesCopy[thisIndex];
    if (!nextEpisode || !thisEpisode) {
      console.info(`Could not find episodes at indices ${thisIndex} or ${thisIndex + 1}`);
      return;
    }

    // If moved block passed a blockId boundary, update blockIds which will replace the move
    if (thisEpisode.blockId !== nextEpisode.blockId) {
      episodesCopy[thisIndex]!.blockId = nextEpisode.blockId;
    }
    else {
      // Swap positions when in same block
      episodesCopy[thisIndex + 1] = { ...thisEpisode };
      episodesCopy[thisIndex] = { ...nextEpisode };
    }

    setVolatileProject({
      ...volatileProject,
      episodes: episodesCopy,
    });

    // Keep moved episode in view / focused
    setTimeout(() => {
      const li = document.getElementById(`episode-${episode.id}`);
      if (!(li instanceof HTMLElement)) return;
      const thumb = li.querySelector('[draggable="true"]');
      const focusEl = thumb instanceof HTMLElement ? thumb : li;
      focusEl.tabIndex = 0;
      focusEl.focus();
      focusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  // Memoized file name and route for prettier display
  const fileName = useMemo(() => {
    if (!selectedFile) return "No file selected";
    const parts = selectedFile.split(/[/\\]/);
    return parts[parts.length - 1];
  }, [selectedFile]);
  // const fileRoute = useMemo(() => {
  //   if (!selectedFile) return "No file selected";

  //   // remove file name from path
  //   const delim = selectedFile.includes("/") ? "/" : "\\";
  //   const parts = selectedFile.split(/[/\\]/);
  //   parts.pop();
  //   return parts.join(delim);

  // }, [selectedFile]);
  // const delim = useMemo(() => {
  //   if (!selectedFile) return "/";
  //   return selectedFile.includes("/") ? "/" : "\\";
  // }, [selectedFile]);

  const isLastInBlockAndEmpty = useMemo(() => {
    if (!volatileProject) return false;
    const episodesInBlock = volatileProject.episodes
      .filter(e => e.blockId === episode.blockId)
      .filter(e => !e.filePath?.trim().length);
    if (episodesInBlock.length === 0) return false;
    return episodesInBlock[episodesInBlock.length - 1]?.id === episode.id;
  }, [volatileProject, episode]);

  return (
    <li
      className={`w-full flex flex-row items-center ps-1 select-none min-w-0 ${isDragOver ? "ring-2 ring-science-500/60 rounded-sm" : ""}`}
      id={`episode-${episode.id}`}
    >
      <div className="flex flex-row gap-x-6 items-center pe-10">
        {/* Delete button */}
        <button
          className={`€icon text-flare-700 hover:text-red-alert-500 ${isLastInBlockAndEmpty ? "opacity-0 cursor-[inherit]" : ""}`}
          onClick={isLastInBlockAndEmpty ? undefined : deleteEpisode}
          aria-hidden={isLastInBlockAndEmpty}
        >
          <IconDeleteOutline className="size-6" />
        </button>
        {/* Start time */}
        <span className={`w-[5ch] ${!episode.cachedStartTime ? "text-flare-700" : ""}`}>{episode.cachedStartTime ?? "--:--"}</span>
        {/* Duration */}
        <span className={`w-[7ch] ps-0.5 ${!episode.duration ? "text-flare-700" : ""}`}>{episode.duration ? secondsToTimeString(episode.duration) : "-"}</span>
      </div>

      {/* Custom file input */}
      <label className="bg-abyss-500 rounded-sm flex flow-row items-center justify-between gap-x-4 ps-3 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <span style={{ direction: "rtl" }} className="block overflow-hidden text-start min-w-0">
            <span style={{ direction: "ltr" }} className={`truncate inline-block align-middle ${selectedFile ? "" : "text-flare-700"}`}>
              {selectedFile ?
                // TODO fix truncation instead of this
                // <><span className="text-flare-700">{fileRoute}{delim}</span>{fileName}</>
                <><span className="text-flare-700"></span>{fileName}</>
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
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
      >
        <IconDragIndicator className="size-6" />
      </span>
    </li>
  );
}
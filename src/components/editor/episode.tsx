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
  const [selectedFile, setSelectedFile] = useState<string | null>(episode.filePath || null);

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
      return { ...prevProject, episodes: [...prevProject.episodes, newEpisode] };
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

    // Update project state
    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;

      const draggedIndex = prevProject.episodes.findIndex((ep) => ep.id === draggedId);
      const targetIndex = prevProject.episodes.findIndex((ep) => ep.id === episode.id);
      if (draggedIndex === -1 || targetIndex === -1) return prevProject;

      const newEpisodes = [...prevProject.episodes];
      const [draggedEpisode] = newEpisodes.splice(draggedIndex, 1);
      if (!draggedEpisode) return prevProject; // For the type engine
      newEpisodes.splice(targetIndex, 0, draggedEpisode);

      return { ...prevProject, episodes: newEpisodes };
    });
  };

  const moveEpisodeUpOne = () => {
    const currentIndex = volatileProject.episodes.findIndex((ep) => ep.id === episode.id);
    if (currentIndex <= 0) return; // Already at the top

    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;

      const newEpisodes = [...prevProject.episodes];
      const [movedEpisode] = newEpisodes.splice(currentIndex, 1);
      if (!movedEpisode) return prevProject; // For the type engine
      newEpisodes.splice(currentIndex - 1, 0, movedEpisode);

      return { ...prevProject, episodes: newEpisodes };
    });
  };

  const moveEpisodeDownOne = () => {
    const currentIndex = volatileProject.episodes.findIndex((ep) => ep.id === episode.id);
    if (currentIndex === -1 || currentIndex >= volatileProject.episodes.length - 1) return; // Already at the bottom

    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;

      const newEpisodes = [...prevProject.episodes];
      const [movedEpisode] = newEpisodes.splice(currentIndex, 1);
      if (!movedEpisode) return prevProject; // For the type engine
      newEpisodes.splice(currentIndex + 1, 0, movedEpisode);

      return { ...prevProject, episodes: newEpisodes };
    });
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
        <button className="€icon text-flare-700 hover:text-red-alert-500">
          <IconDeleteOutline className="size-6" />
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
      >
        <IconDragIndicator className="size-6" />
      </span>
    </li>
  );
}
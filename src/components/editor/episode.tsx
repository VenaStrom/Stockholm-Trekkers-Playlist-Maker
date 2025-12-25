import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Episode, Project } from "@/types";
import { IconDeleteOutline, IconDragIndicator, IconFolderOutline } from "../icons";
import { open } from "@tauri-apps/plugin-dialog";
import { secondsToTimeString } from "../../functions/time-format";

export default function EpisodeLi({
  episode,
  project,
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

  // Drag handlers
  const [isDragOver, setDragOver] = useState(false);
  const onDragStart = (e: React.DragEvent) => {
    console.debug("episode onDragStart", episode.id);
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
    console.debug("episode onDrop", episode.id, "data:", e.dataTransfer.getData("text/plain"));
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    setDragOver(false);
    if (!draggedId || draggedId === episode.id) return;

    // Reorder episodes in project state
    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;

      const draggedEpisodeIndex = prevProject.episodes.findIndex(e => e.id === draggedId);
      const dropEpisodeIndex = prevProject.episodes.findIndex(e => e.id === episode.id);
      if (draggedEpisodeIndex === -1 || dropEpisodeIndex === -1) return prevProject;

      const newEpisodes = [...prevProject.episodes];
      const [draggedEpisode] = newEpisodes.splice(draggedEpisodeIndex, 1);
      if (!draggedEpisode) return prevProject;
      newEpisodes.splice(dropEpisodeIndex, 0, draggedEpisode);

      return { ...prevProject, episodes: newEpisodes };
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
    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;

      const thisIndex = prevProject.episodes.findIndex(e => e.id === episode.id);
      if (thisIndex <= 0) return prevProject; // Already at top

      const newEpisodes = [...prevProject.episodes];
      const previousEpisode = newEpisodes[thisIndex - 1];
      const thisEpisode = newEpisodes[thisIndex];
      if (!previousEpisode || !thisEpisode) return prevProject;
      newEpisodes[thisIndex - 1] = thisEpisode;
      newEpisodes[thisIndex] = previousEpisode;

      return { ...prevProject, episodes: newEpisodes };
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
    setVolatileProject((prevProject) => {
      if (!prevProject) return prevProject;

      const thisIndex = prevProject.episodes.findIndex(e => e.id === episode.id);
      if (thisIndex === -1 || thisIndex >= prevProject.episodes.length - 1) return prevProject; // Already at bottom

      const newEpisodes = [...prevProject.episodes];
      const nextEpisode = newEpisodes[thisIndex + 1];
      const thisEpisode = newEpisodes[thisIndex];
      if (!nextEpisode || !thisEpisode) return prevProject;
      newEpisodes[thisIndex + 1] = thisEpisode;
      newEpisodes[thisIndex] = nextEpisode;

      return { ...prevProject, episodes: newEpisodes };
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

  // Portal target management, find the block's episode container element
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useEffect(() => {
    let mounted = true;
    const id = `block-episodes-${episode.blockId}`;

    const findAndSet = () => {
      const el = document.getElementById(id);
      if (el instanceof HTMLElement) {
        if (mounted) setContainer(el);
        return true;
      }
      return false;
    };

    if (!findAndSet()) {
      // Poll briefly until the container is rendered (blocks render earlier in most cases)
      const interval = setInterval(() => {
        if (findAndSet()) {
          clearInterval(interval);
        }
      }, 100);
      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }

    return () => { mounted = false; };
  }, [episode.blockId]);

  // Ensure DOM order inside the container matches the project's episode order for this block
  useEffect(() => {
    if (!container) return;
    if (!liRef.current) return;
    if (!project) return;

    // run on next tick to ensure portal node is attached
    const t = setTimeout(() => {
      try {
        const blockEpisodes = project.episodes.filter(ep => ep.blockId === episode.blockId);
        const desiredIndex = blockEpisodes.findIndex(ep => ep.id === episode.id);
        if (desiredIndex === -1) return;

        const children = Array.from(container.children).filter((c) => c.id?.startsWith?.("episode-"));
        const referenceNode = children[desiredIndex] ?? null;
        container.insertBefore(liRef.current as Node, referenceNode);
      }
      catch (err) {
        console.debug('episode reorder error', err);
      }
    }, 0);

    return () => clearTimeout(t);
  }, [container, project, episode.blockId, episode.id]);

  const liRef = useRef<HTMLLIElement | null>(null);

  const li = (
    <li
      ref={liRef}
      className={`w-full flex flex-row items-center ps-1 select-none ${isDragOver ? "ring-2 ring-science-500/60 rounded-sm" : ""}`}
      id={`episode-${episode.id}`}
    >
      <div className="flex flex-row gap-x-6 items-center pe-10">
        {/* Delete button */}
        <button className="€icon text-flare-700 hover:text-red-alert-500">
          <IconDeleteOutline className="size-6" />
        </button>
        {/* Start time */}
        <span className={`w-[5ch] ${!episode.cachedStartTime ? "text-flare-700" : ""}`}>{episode.cachedStartTime ?? "--:--"}</span>
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
          onClick={chooseFile}
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
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            moveEpisodeDownOne();
          }
        }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
      >
        <IconDragIndicator className="size-6" />
      </span>
    </li>
  );

  // If we have a container, portal the LI into it. Otherwise return a hidden placeholder
  if (container) return createPortal(li, container);

  return (
    <div style={{ display: "none" }} aria-hidden>
      {li}
    </div>
  );
}
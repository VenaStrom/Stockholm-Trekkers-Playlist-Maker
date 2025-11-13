import { useMemo, useState } from "react";
import { Episode, Project } from "../../project-types";
import { IconDragHandle, IconFolderOutline } from "../icons";
import { open } from "@tauri-apps/plugin-dialog";

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

  const secondsToTimeString = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const hoursStr = hours > 0 ? String(hours).padStart(2, '0') + ':' : '';
    const minutesStr = String(minutes).padStart(2, '0') + ':';
    const secondsStr = String(seconds).padStart(2, '0');

    return hoursStr + minutesStr + secondsStr;
  };

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
    <li className="w-full flex flex-row items-center gap-x-10 ps-1">
      <div className="flex flex-row gap-x-6 items-center">
        <IconDragHandle className="size-6 text-flare-700 cursor-grab" />
        <span className={`w-[5ch] ${!episode.cachedStartTime ? "text-flare-700" : ""}`}>{episode.cachedStartTime || "--:--"}</span>
        <span className={`w-[7ch] ps-0.5 ${!episode.duration ? "text-flare-700" : ""}`}>{episode.duration ? secondsToTimeString(episode.duration) : "-"}</span>
      </div>

      <label className="bg-abyss-500 rounded-sm flex flow-row items-center justify-between gap-x-4 ps-3 flex-1">
        <div className="flex-1 min-w-0">
          <span style={{ direction: "rtl" }} className="block overflow-hidden text-start">
            <span style={{ direction: "ltr" }} className={`truncate inline-block align-middle ${selectedFile ? "" : "text-flare-700"}`}>
              {/* {selectedFile ? path.basename(selectedFile).then((b) => `${b}`) : "No file selected"} */}
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
    </li>
  );
}
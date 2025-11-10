import { useState } from "react";
import { Episode, Project } from "../../project-types";
import { IconFolderOutline } from "../icons";
import { open } from "@tauri-apps/plugin-dialog";
import { updateEpisodeInProject } from "../../functions/project-walker";

export default function EpisodeLi({
  episode,
  episodeIndex,
  project: volatileProject,
  projectSetter: setVolatileProject,

}: {
  episode: Episode;
  episodeIndex: number;
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
      return;
    }

    setSelectedFile(filePath);

    // Update the episode's filePath in the project state
    updateEpisodeInProject(
      { ...episode, filePath },
      volatileProject,
      setVolatileProject,
    );
  };

  return (
    <li className="w-full flex flex-row items-center gap-x-4 ps-1">
      <span className="w-[1ch] text-sm">
        {episodeIndex + 1}
      </span>

      <span>
        00:00
      </span>

      <span className="flex-1"></span>

      <label className="bg-abyss-500 rounded-sm flex flow-row items-center justify-between gap-x-4 ps-3 min-w-1/2">
        <span className={`${selectedFile || "text-flare-700"}`}>
          {selectedFile || "No file selected"}
        </span>

        <button
          className="bg-abyss-200 hover:bg-spore-500 ps-3"
          // onClick={() => document.getElementById(`${episode.id}-add-file`)?.click()}
          onClick={onFileChange}
        >
          Select file
          <IconFolderOutline className="inline size-6 ms-0.5" />
        </button>

        {/* Hidden file input */}
        {/* <input
          id={`${episode.id}-add-file`}
          type="file"
          className="hidden"
          accept="audio/*,video/*,image/*" // TODO - reconsider having an accept at all. This would be based on what VLC would accept.
          onChange={onFileChange}
        /> */}
      </label>
    </li>
  );
}
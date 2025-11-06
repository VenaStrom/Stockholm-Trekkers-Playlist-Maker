import { useState } from "react";
import { Episode, Project } from "../../project-types";
import { IconFolderOutline } from "../icons";

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
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setSelectedFile(file.name);
    } else {
      setSelectedFile(null);
    }

    console.log(file);
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

      <label className="bg-abyss-500 rounded-sm flex flow-row items-center justify-between gap-x-4 ps-3 w-1/2">
        <span className={`${selectedFile || "text-flare-700"}`}>
          {selectedFile || "No file selected"}
        </span>

        <button
          className="bg-abyss-200 hover:bg-spore-500 ps-3"
          onClick={() => document.getElementById(`${episode.id}-add-file`)?.click()}
        >
          Select file
          <IconFolderOutline className="inline size-6 ms-0.5" />
        </button>

        {/* Hidden file input */}
        <input
          id={`${episode.id}-add-file`}
          type="file"
          className="hidden"
          accept="audio/*,video/*,image/*" // TODO - reconsider having an accept at all. This would be based on what VLC would accept.
          onChange={onFileChange}
        />
      </label>
    </li>
  );
}
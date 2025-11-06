import { useState } from "react";
import { Project } from "../project-types";
import { IconDeleteOutline, IconEditOutline, IconFileExportOutline } from "./icons";
import Dialog from "./dialog";
import { usePageContext } from "./page-context/use-page-context";
import { path } from "@tauri-apps/api";
import * as fs from "@tauri-apps/plugin-fs";
import { useToast } from "./toast/useToast";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { appDataDir, downloadDir, tempDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { copyFile, exists } from "@tauri-apps/plugin-fs";
import { DirName } from "../global";
import { PageRoute } from "./page-context/page.internal";

export default function ProjectCard({
  project,
}: {
  project: Project;
}) {
  const { setProjects, setProjectId, setRoute } = usePageContext();
  const { toast } = useToast();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const downloadSaveFile = async () => {
    const savedName = `${project.id}.json`;
    const newName = `project_file_${project.date || project.id}.json`;

    const projectPath = await path.join(await appDataDir(), DirName.Projects, savedName);

    if (!exists(projectPath)) {
      toast(
        <span>
          Error: Project file not found.
        </span>
      );
      return;
    }

    const downloadFolder = await open({
      defaultPath: await downloadDir(),
      directory: true,
      title: "Select download location",
      canCreateDirectories: true,
    });
    if (!downloadFolder) return;

    if (!project.date) {
      toast(
        <span>
          The project is missing a date so the exported file will use the project ID instead.
        </span>
      );
    }

    // Copy file to tmp folder before downloading to allow for renaming
    const tempPath = await path.join(await tempDir(), newName);
    await copyFile(projectPath, tempPath)
      .catch((err: string) => {
        toast(
          <span>
            Error copying file. Please try again.
            <br />
            {/* TODO - prettify this error message in some way */}
            <span className="text-xs opacity-60 max-w-prose overflow-x-auto">{err}</span>
          </span>
        );
        throw err;
      });

    const anchor = document.createElement("a");
    anchor.href = tempPath;
    anchor.download = newName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    const destinationPath = await path.join(downloadFolder as string, newName);

    toast(
      <span>
        Downloading {project.date} project file.{" "}
        <a href="" target="_blank" rel="noreferrer" onClick={(e) => {
          e.preventDefault();

          revealItemInDir(destinationPath);
        }}>Show</a>
      </span>
    );
  };

  return (<>
    {/* Delete dialog */}
    <Dialog
      visible={deleteDialogVisible}
      setVisible={setDeleteDialogVisible}
      dialogHeader={<p className="text-lg">Delete Project {project.date}</p>}
      dialogContent={<p>
        Are you sure you want to delete the project <span className="italic">{project.date}?</span>
        <span className="text-sm text-flare-500/60">
          <br />
          This will project contains {project.blocks.length} blocks and {project.blocks.reduce((sum, block) => sum + block.episodes.length, 0)} episodes.
          <br />
          Created: {new Date(project.dateCreated).toLocaleDateString("en-SE")} {new Date(project.dateCreated).toLocaleTimeString("en-SE")}
          {project.dateModified && project.dateModified !== project.dateCreated && (
            <><br />Modified: {new Date(project.dateModified).toLocaleDateString("en-SE")} {new Date(project.dateModified).toLocaleTimeString("en-SE")}</>
          )}
        </span>
      </p>}
      buttons={[
        <button key={"cancel-button"} onClick={() => setDeleteDialogVisible(false)} >
          Cancel
        </button>,
        <button
          data-focus="true"
          key={"delete-button"}
          className="gap-x-1 pe-1 hover:bg-red-alert-500"
          onClick={async () => {
            setProjects((prevProjects) => prevProjects.filter((p) => p.id !== project.id));
            setDeleteDialogVisible(false);
            await fs.remove(await path.join(await appDataDir(), DirName.Projects, project.id), { recursive: true });
          }}
        >
          Delete
          <IconDeleteOutline className="inline size-6" />
        </button>
      ]}
    />

    <li className="w-full min-h-36 bg-abyss-800 rounded-sm p-4 ps-5 flex flex-row gap-x-4 *:h-full">
      {/* Date and description */}
      <div className="">
        <p className="text-xl">{project.date.trim() ? project.date : <span className="text-flare-700">[ no date set ]</span>}</p>
        <p>{project.description?.trim() ?
          project.description
          :
          <span className="text-flare-700">No description set</span>}
        </p>
      </div>

      <span className="flex-1"></span>

      {/* Stats */}
      <ul className="flex flex-col justify-start items-end">
        <li>
          Created: {new Date(project.dateCreated).toLocaleDateString("en-SE")} {new Date(project.dateCreated).toLocaleTimeString("en-SE")}
        </li>
        {project.dateModified && project.dateModified !== project.dateCreated && (
          <li>
            Modified: {new Date(project.dateModified).toLocaleDateString("en-SE")} {new Date(project.dateModified).toLocaleTimeString("en-SE")}
          </li>
        )}
        <li>
          {project.blocks.length} blocks
        </li>
        <li>
          {project.blocks.reduce((sum, block) => sum + block.episodes.length, 0)} episodes
        </li>
      </ul>

      {/* Actions */}
      <div className="flex flex-col justify-between w-24">
        <button className="pe-1.5 ps-3 hover:bg-science-500" onClick={() => { setRoute(PageRoute.Editor); setProjectId(project.id); }}>
          Edit
          <span className="flex-1"></span>
          <IconEditOutline className="inline size-6" />
        </button>
        <button
          className="pe-1.5 ps-3 hover:bg-spore-500"
          onClick={downloadSaveFile}
        >
          Export
          <span className="flex-1"></span>
          <IconFileExportOutline className="inline size-6" />
        </button>
        <button
          className="pe-1.5 ps-3 hover:bg-red-alert-500"
          onClick={() => setDeleteDialogVisible(true)}
        >
          Delete
          <span className="flex-1"></span>
          <IconDeleteOutline className="inline size-6" />
        </button>
      </div>
    </li>
  </>);
}
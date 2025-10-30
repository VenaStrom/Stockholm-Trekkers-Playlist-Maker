import { useState } from "react";
import { Project } from "../project-types";
import { IconDeleteOutline, IconEditOutline, IconFileExportOutline } from "./icons";
import Dialog from "./dialog";
import { usePageContext } from "./page-context/use-page-context";
import { invoke } from "@tauri-apps/api/core";
import { useToast } from "./toast/useToast";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { appDataDir, downloadDir } from "@tauri-apps/api/path";
import { path } from "@tauri-apps/api";
import { open } from "@tauri-apps/plugin-dialog";
import { exists } from "@tauri-apps/plugin-fs";

export default function ProjectCard({
  project,
}: {
  project: Project;
}) {
  const { setProjects } = usePageContext();
  const { toast } = useToast();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const downloadSaveFile = async () => {
    const fileName = `${project.id}.json`;
    const projectPath = await path.join(await appDataDir(), fileName);

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

    const anchor = document.createElement("a");
    anchor.href = projectPath;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    
    const destinationPath = await path.join(downloadFolder as string, fileName);

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
        <button key={"cancel-button"} data-focus="true" onClick={() => setDeleteDialogVisible(false)} >
          Cancel
        </button>,
        <button
          key={"delete-button"}
          className="gap-x-1 pe-1 hover:bg-red-alert-500"
          onClick={() => {
            setProjects((prevProjects) => prevProjects.filter((p) => p.id !== project.id));
            setDeleteDialogVisible(false);
            invoke("delete_project", { projectId: project.id })
              .then(() => {
                console.log("Project deleted successfully");
              })
              .catch((error) => {
                console.error("Error deleting project:", error);
              });
          }}
        >
          Delete
          <IconDeleteOutline className="inline size-6" />
        </button>
      ]}
    />

    <li className="w-full min-h-36 bg-abyss-800 rounded-sm p-4 flex flex-row gap-x-4 *:h-full">
      <div className="">
        <p className="text-xl">{project.date}</p>
        {project.description && <p>
          {project.description}
        </p>}
      </div>

      <span className="flex-1"></span>

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
        <button className="pe-1.5 ps-3 hover:bg-science-500">
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
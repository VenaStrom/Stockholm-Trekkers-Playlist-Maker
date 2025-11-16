import { useState } from "react";
import { Project } from "../project-types";
import { IconDeleteOutline, IconEditOutline, IconFileExportOutline } from "./icons";
import Dialog from "./dialog";
import { usePageContext } from "./page-context/use-page-context";
import { path } from "@tauri-apps/api";
import * as fs from "@tauri-apps/plugin-fs";
import { useToast } from "./toast/useToast";
import { appDataDir } from "@tauri-apps/api/path";
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

  const downloadSaveFolder = async () => {
    toast(
      <span>
        Exporting project save folder is not yet implemented.
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
          This will project contains {project.blocks.filter(b => b.episodes.filter(e => e.filePath).length).length} blocks and {project.blocks.reduce((sum, block) => sum + block.episodes.filter(e => e.filePath).length, 0)} episodes.
          <br />
          Created: {new Date(project.dateCreated).toLocaleDateString("en-SE")} {new Date(project.dateCreated).toLocaleTimeString("en-SE")}
          {
            project.dateModified
            && project.dateModified !== project.dateCreated
            && (
              <><br />Modified: {new Date(project.dateModified).toLocaleDateString("en-SE")} {new Date(project.dateModified).toLocaleTimeString("en-SE")}</>
            )
          }
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
          {project.blocks.filter(b => b.episodes.filter(e => e.filePath).length).length} blocks
        </li>
        <li>
          {project.blocks.reduce((sum, block) => sum + block.episodes.filter(e => e.filePath).length, 0)} episodes
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
          onClick={downloadSaveFolder}
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
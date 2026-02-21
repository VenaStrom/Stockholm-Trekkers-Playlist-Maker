import { useState } from "react";
import type { ProjectMeta } from "@/types";
import { IconDeleteOutline, IconEditOutline } from "@/components/icons";
import { usePageContext, PageRoute } from "@/components/page-context";
import { useToast } from "@/components/toast";
import { deleteProject } from "@/functions/project";
import Dialog from "@/components/dialog";
import ExportButton from "@/components/button/export-button";

export default function ProjectCard({
  projectMeta,
}: {
  projectMeta: ProjectMeta;
}) {
  const { toast } = useToast();
  const { setProjectID, setRoute, reloadProjectMetaData } = usePageContext();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const handleDeleteProject = () => {
    deleteProject(projectMeta.id)
      .then(() => {
        toast(
          <span>
            Successfully deleted project <span className="italic">{projectMeta.date}</span>.
          </span>,
        );
      })
      .catch((error) => {
        toast(
          <span>
            Failed to delete project <span className="italic">{projectMeta.date}</span>: {error instanceof Error ? error.message : String(error)}
          </span>,
        );
      })
      .finally(() => {
        reloadProjectMetaData();
        setDeleteDialogVisible(false);
      });
  };

  return (<>
    {/* Delete dialog */}
    <Dialog
      visible={deleteDialogVisible}
      setVisible={setDeleteDialogVisible}
      dialogHeader={<p className="text-lg">Delete Project {projectMeta.date}</p>}
      dialogContent={<p>
        Are you sure you want to delete the project <span className="italic">{projectMeta.date}?</span>
        <span className="text-sm text-flare-500/60">
          <br />
          This will project contains {projectMeta.blockCount} blocks and {projectMeta.episodeCount} episodes.
          <br />
          Created: {new Date(projectMeta.dateCreated).toLocaleDateString("en-SE")} {new Date(projectMeta.dateCreated).toLocaleTimeString("en-SE")}
          {
            projectMeta.dateModified
            && projectMeta.dateModified !== projectMeta.dateCreated
            && (
              <><br />Modified: {new Date(projectMeta.dateModified).toLocaleDateString("en-SE")} {new Date(projectMeta.dateModified).toLocaleTimeString("en-SE")}</>
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
          onClick={handleDeleteProject}
        >
          Delete
          <IconDeleteOutline className="inline size-6" />
        </button>
      ]}
    />

    <li className="w-full min-h-36 bg-abyss-900 rounded-sm p-4 ps-5 flex flex-row gap-x-4 *:h-full">
      {/* Date and description */}
      <div className="max-w-prose h-full overflow-hidden">
        <p className="text-xl">{projectMeta.date.trim() ? projectMeta.date : <span className="text-flare-700">[ no date set ]</span>}</p>
        <div
          className="overflow-scroll"
        >
          <pre className="max-w-prose text-sm text-abyss-200 mt-1">
            {projectMeta.description?.trim() ?
              projectMeta.description
              :
              <span className="text-flare-700">No description set</span>
            }
          </pre>
        </div>
      </div>

      <span className="flex-1"></span>

      {/* Stats */}
      <ul className="flex flex-col justify-start items-end">
        <li>
          Created: {new Date(projectMeta.dateCreated).toLocaleDateString("en-SE")} {new Date(projectMeta.dateCreated).toLocaleTimeString("en-SE")}
        </li>
        {projectMeta.dateModified && projectMeta.dateModified !== projectMeta.dateCreated && (
          <li>
            Modified: {new Date(projectMeta.dateModified).toLocaleDateString("en-SE")} {new Date(projectMeta.dateModified).toLocaleTimeString("en-SE")}
          </li>
        )}
        <li>
          {projectMeta.blockCount} blocks
        </li>
        <li>
          {projectMeta.episodeCount} episodes
        </li>
      </ul>

      {/* Actions */}
      <div className="flex flex-col justify-start gap-y-4 w-24">
        <button className="pe-1.5 ps-3 hover:bg-science-500" onClick={() => { setRoute(PageRoute.Editor); setProjectID(projectMeta.id); }}>
          Edit
          <span className="flex-1"></span>
          <IconEditOutline className="inline size-6" />
        </button>

        <ExportButton projectID={projectMeta.id} />

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
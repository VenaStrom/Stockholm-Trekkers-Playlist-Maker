import { useEffect, useState } from "react";
import type { Project, ProjectMeta } from "@/types";
import { IconDeleteForeverOutline, IconDeleteOutline, IconEditOutline } from "@/components/icons";
import { usePageContext, PageRoute } from "@/components/page-context";
import { useToast } from "@/components/toast";
import { deleteProject, openProject } from "@/functions/project";
import Dialog from "@/components/dialog";
import ExportButton from "@/components/button/export-button";
import ProjectSummary from "@/components/project-summary";

export default function ProjectCard({
  projectMeta,
}: {
  projectMeta: ProjectMeta;
}) {
  const { toast } = useToast();
  const { setProjectID, setRoute, reloadProjectMetaData, isPowerMode } = usePageContext();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  // Full project data for the block/episode summary, like the v3 card previews
  const [projectData, setProjectData] = useState<Project | null>(null);
  useEffect(() => {
    openProject(projectMeta.id)
      .then(setProjectData)
      .catch((err: unknown) => {
        console.error(`Failed to load project data for card ${projectMeta.id}:`, err);
      });
  }, [projectMeta.id, projectMeta.dateModified]);

  const handleDeleteProject = () => {
    deleteProject(projectMeta.id)
      .then(() => {
        toast(
          <span>
            Successfully deleted project <span className="italic">{projectMeta.date}</span>.
          </span>,
        );
      })
      .catch((err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        toast(
          <span>
            Failed to delete project <span className="italic">{projectMeta.date}</span>: {errorMessage}
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
          This project contains {projectMeta.blockCount} blocks and {projectMeta.episodeCount} episodes.
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
        </button>,
      ]}
    />

    <li className="w-full min-h-fit bg-abyss-900 rounded-sm p-4 ps-5 flex flex-row gap-x-4 *:h-full">
      {/* Date, description, and block summary stacked */}
      <div className="flex-1 min-w-0 h-full overflow-hidden">
        <p className="text-xl">{projectMeta.date.trim() ? projectMeta.date : <span className="text-flare-700">[ no date set ]</span>}</p>
        {/* Personal note, styled as an aside so it doesn't read as playlist data */}
        {projectMeta.description.trim() !== "" && (
          <div className="mt-2">
            <p className="text-sm uppercase tracking-widest text-flare-700 select-none">Note</p>
            <pre className="max-w-prose text-sm italic text-flare-700 whitespace-pre-wrap border-s-2 border-abyss-200/50 ps-2 mt-0.5">
              {projectMeta.description}
            </pre>
          </div>
        )}

        {/* Block summary */}
        <div className="text-sm mt-3 pe-3">
          <p className="text-sm uppercase tracking-widest text-flare-700 select-none pb-0.5">Playlist</p>
        {projectData && <ProjectSummary project={projectData} />}
        </div>
      </div>

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
          onClick={() => isPowerMode ? handleDeleteProject() : setDeleteDialogVisible(true)}
          title={isPowerMode ? "Delete project instantly" : "Delete project"}
        >
          Delete
          <span className="flex-1"></span>
          {isPowerMode
            ? <IconDeleteForeverOutline className="size-6 animate-shiver origin-bottom" />
            : <IconDeleteOutline className="inline size-6" />}
        </button>
      </div>
    </li>
  </>);
}
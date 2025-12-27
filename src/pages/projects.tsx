import { useEffect } from "react";
import { usePageContext } from "../components/page-context/use-page-context";
import ProjectCard from "../components/project-card";
import { ProjectMeta } from "@/types";
import { IconAddBoxOutline, IconFolderOutline } from "../components/icons";
import { path } from "@tauri-apps/api";
import { useToast } from "../components/toast/useToast";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { invoke } from "@tauri-apps/api/core";
import { FileName, PathName } from "@/global";
import { createProject } from "@/functions/project/create-project";

export default function Projects() {
  const { toast } = useToast();
  const { setHeaderText, projectMetas, reload } = usePageContext();
  useEffect(() => setHeaderText("Projects"), [setHeaderText]);

  const revealProjectsFolder = () => {
    path.join(PathName.UserProjectsDir, FileName.RevealTarget)
      .then(async (hiddenSubFolderPath) => {
        await invoke("mkdir", { dirPath: hiddenSubFolderPath, hidden: true, });
        await revealItemInDir(hiddenSubFolderPath);
      })
      .catch((e) => {
        console.error("Failed to open projects folder:", e);
        toast("Failed to open projects folder. Please try again.");
      });
  };

  const makeNewProject = () => {
    createProject()
      .then(() => {
        reload(); // To have this one appear in the list
        toast(<>
          Made new project.
          {/* Maybe remove this line VVV */}
          {/* Made new project. <a href="" target="_blank" rel="noreferrer" onClick={(e) => { e.preventDefault(); setRoute(PageRoute.Editor); setProjectId(newProject.id); }}>Edit</a> */}
        </>);
      })
      .catch((e) => {
        console.error("Failed to create new project:", e);
        toast("Failed to create new project. Please try again.");
      });
  };

  const sortByDateCreated = (a: ProjectMeta, b: ProjectMeta) => b.dateCreated - a.dateCreated;

  return (
    <main className="w-full flex flex-col items-center overflow-y-auto">
      <p className="p-4 pt-5">Load, export or import previous projects or create entirely new ones.</p>

      <ul className="w-11/12 md:w-7/12 flex flex-col gap-y-4 h-full overflow-y-auto pe-4 pt-1.5">
        <li className="w-full flex flex-row justify-end gap-x-3">
          <button className="bg-abyss-200 hover:bg-spore-500" onClick={revealProjectsFolder}>
            <IconFolderOutline className="inline size-6 me-1" />
            Show folder
          </button>

          <button className="bg-abyss-200 hover:bg-science-500" onClick={makeNewProject}>
            <IconAddBoxOutline className="inline size-6 me-1" />
            New Project
          </button>
        </li>

        {projectMetas.length ? projectMetas.sort(sortByDateCreated).map((project, index) => (
          <ProjectCard key={index} projectMeta={project} />
        ))
          :
          <li className="p-4 py-8">
            <p className="text-center text-sm italic opacity-70">No projects found. Create a new project or open the projects folder to add existing ones.</p>
          </li>
        }
      </ul>
    </main>
  );
}
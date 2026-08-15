import { useEffect } from "react";
import { usePageContext } from "@/components/page-context";
import ProjectCard from "@/components/project-card";
import type { ProjectMeta } from "@/types";
import { IconAddBoxOutline, IconDownload, IconFolderOutline } from "@/components/icons";
import { path } from "@tauri-apps/api";
import { useToast } from "@/components/toast";
import { open } from "@tauri-apps/plugin-dialog";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { invoke } from "@tauri-apps/api/core";
import { FileName, PathName } from "@/global";
import { createProject, importProjectFromFile, migrateV3SaveFilesOnce } from "@/functions/project";

export default function Projects() {
  const { toast } = useToast();
  const { setHeaderText, projectMetas, reloadProjectMetaData } = usePageContext();
  useEffect(() => setHeaderText("Projects"), [setHeaderText]);

  // One-time sweep of the v3 (Electron) install's save files
  useEffect(() => {
    migrateV3SaveFilesOnce()
      .then((migratedCount) => {
        if (migratedCount === 0) return;
        reloadProjectMetaData();
        toast(`Imported ${migratedCount === 1 ? "1 project" : `${migratedCount} projects`} from version 3.`);
      })
      .catch((err: unknown) => {
        console.error("v3 save file migration failed:", err);
      });
  }, [reloadProjectMetaData, toast]);

  const importFromFile = () => {
    open({
      title: "Import a project save file",
      filters: [
        { name: "JSON", extensions: ["json"] },
        { name: "All files", extensions: ["*"] },
      ],
    })
      .then(async (filePath) => {
        if (!filePath) return;
        const meta = await importProjectFromFile(filePath);
        reloadProjectMetaData();
        toast(<span>
          Imported project <span className="italic">{meta.date.trim() ? meta.date : "[ no date set ]"}</span>.
        </span>);
      })
      .catch((err: unknown) => {
        console.error("Failed to import project:", err);
        toast("Failed to import project. Is it a valid save file?");
      });
  };

  const revealProjectsFolder = () => {
    path.join(PathName.UserProjectsDir, FileName.RevealTarget)
      .then(async (hiddenSubFolderPath) => {
        await invoke("mkdir", { dirPath: hiddenSubFolderPath, hidden: true });
        await revealItemInDir(hiddenSubFolderPath);
      })
      .catch((err: unknown) => {
        console.error("Failed to open projects folder:", err);
        toast("Failed to open projects folder. Please try again.");
      });
  };

  const makeNewProject = () => {
    createProject()
      .then(() => {
        reloadProjectMetaData(); // To have this one appear in the list
        toast(<>
          Made new project.
        </>);
      })
      .catch((err: unknown) => {
        console.error("Failed to create new project:", err);
        toast("Failed to create new project. Please try again.");
      });
  };

  const sortByDateCreated = (a: ProjectMeta, b: ProjectMeta) => b.dateCreated - a.dateCreated;

  return (
    <main className="w-full flex flex-col items-center overflow-y-auto">
      <p className="p-4 pt-5">Load, export or import previous projects or create entirely new ones.</p>

      <ul className="w-11/12 lg:w-9/12 2xl:w-7/12 flex flex-col gap-y-4 min-h-full overflow-y-auto pe-4 pt-1.5 mb-10">
        <li className="w-full flex flex-row justify-end gap-x-3">
          <button className="bg-abyss-200 hover:bg-spore-500" onClick={importFromFile} title="Import a v4 or v3 project save file">
            <IconDownload className="inline size-6 me-1" />
            Import
          </button>

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
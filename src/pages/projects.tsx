import { useEffect } from "react";
import { usePageContext } from "../components/page-context/use-page-context";
import ProjectCard from "../components/project-card";
import { demoProject, EmptyProject } from "../project-types";
import { IconAddBoxOutline, IconFolderOutline } from "../components/icons";
import { path } from "@tauri-apps/api";
import { appDataDir } from "@tauri-apps/api/path";
import * as fs from "@tauri-apps/plugin-fs";
import { useToast } from "../components/toast/useToast";
import { DirName } from "../global";
import { invoke } from "@tauri-apps/api/core";

export default function Projects() {
  const { toast } = useToast();
  const { setHeaderText, projects, setProjects } = usePageContext();

  useEffect(() => setHeaderText("Projects"), [setHeaderText]);
  useEffect(() => setProjects([demoProject, demoProject]), [setProjects]);

  const makeNewProject = async () => {
    // Make folder
    await invoke("make_app_dir_folder", { folderName: DirName.Projects, appDir: await appDataDir() });

    // Make file
    const filePath = await path.join(await appDataDir(), DirName.Projects, "/new-project.json");
    await fs.create(filePath);

    // Write file
    const content = JSON.stringify({ ...EmptyProject }, null, 2);
    await fs.writeFile(filePath, new TextEncoder().encode(content));

    toast(<>Made new project. <a href="" target="_blank" rel="noreferrer">Edit</a></>)

    console.log("Wrote, ", filePath);
  };

  return (
    <main className="w-full flex flex-col items-center overflow-y-auto">
      <p className="p-4 pt-5">Load, export or import previous projects or create entirely new ones.</p>

      <ul className="w-11/12 md:w-7/12 flex flex-col gap-y-4 h-full overflow-y-auto pe-4 pt-1.5">
        <li className="w-full flex flex-row justify-end gap-x-3">
          <button className="hover:bg-spore-500">
            <IconFolderOutline className="inline size-6 me-1" />
            Show folder
          </button>
          <button className="hover:bg-science-500" onClick={makeNewProject}>
            <IconAddBoxOutline className="inline size-6 me-1" />
            New Project
          </button>
        </li>

        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </ul>
    </main>
  );
}
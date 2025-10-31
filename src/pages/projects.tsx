import { useEffect } from "react";
import { usePageContext } from "../components/page-context/use-page-context";
import ProjectCard from "../components/project-card";
import { demoProject, EmptyProject, Project } from "../project-types";
import { IconAddBoxOutline, IconEditOutline, IconFolderOutline } from "../components/icons";
import { path } from "@tauri-apps/api";
import { appDataDir } from "@tauri-apps/api/path";
import * as fs from "@tauri-apps/plugin-fs";
import { useToast } from "../components/toast/useToast";
import { DirName } from "../global";
import { invoke } from "@tauri-apps/api/core";
import { revealItemInDir } from "@tauri-apps/plugin-opener";

export default function Projects() {
  const { toast } = useToast();
  const { setHeaderText, projects, setProjects } = usePageContext();

  useEffect(() => setHeaderText("Projects"), [setHeaderText]);
  useEffect(() => {
    const loadProjects = async () => {
      const projectsDir = await path.join(await appDataDir(), DirName.Projects);

      // If it doesn't exist, cancel
      const dirExists = await fs.exists(projectsDir);
      if (!dirExists) return;

      const loadedProjects: Project[] = [];

      // Read folder
      const projectFileNames = (await fs.readDir(projectsDir)).filter(i => i.isFile).map(i => i.name);
      for (const fileName of projectFileNames) {
        try {
          const filePath = await path.join(projectsDir, fileName);
          const fileContent = await fs.readFile(filePath);
          const decoder = new TextDecoder("utf-8");
          const decodedContent = decoder.decode(fileContent);
          const project: Project = JSON.parse(decodedContent);
          loadedProjects.push(project);
        } catch (e) {
          console.error("Failed to load project file:", fileName, e);
        }
      }

      setProjects(loadedProjects);
    };
    loadProjects();
  }, [setProjects]);

  const openProjectsFolder = async () => {
    const folderPath = await path.join(await appDataDir(), DirName.Projects, ".target");

    await invoke("make_app_dir_folder", { folderName: DirName.Projects, appDir: await appDataDir() });

    await revealItemInDir(folderPath);
  };

  const makeNewProject = async () => {
    // Make folder
    await invoke("make_app_dir_folder", { folderName: DirName.Projects, appDir: await appDataDir() });

    const createdTimestamp = Date.now();
    const fileName = `${createdTimestamp}.json`;
    const filePath = await path.join(await appDataDir(), DirName.Projects, fileName);

    // Make file
    await fs.create(filePath);

    // Make project object
    const newProject: Project = {
      ...EmptyProject,
      id: createdTimestamp.toString(),
      dateCreated: createdTimestamp,
    };
    const content = JSON.stringify(newProject, null, 2);
    setProjects((prev) => [...prev, newProject]);

    // Write file
    await fs.writeFile(filePath, new TextEncoder().encode(content));

    toast(<>
      Made new project. <a href="" target="_blank" rel="noreferrer" onClick={(e) => { e.preventDefault(); }}>Edit</a>
    </>);

    console.log("Wrote, ", filePath);
  };

  return (
    <main className="w-full flex flex-col items-center overflow-y-auto">
      {projects.length ? <>
        <p className="p-4 pt-5">Load, export or import previous projects or create entirely new ones.</p>

        <ul className="w-11/12 md:w-7/12 flex flex-col gap-y-4 h-full overflow-y-auto pe-4 pt-1.5">
          <li className="w-full flex flex-row justify-end gap-x-3">
            <button className="hover:bg-spore-500" onClick={openProjectsFolder}>
              <IconFolderOutline className="inline size-6 me-1" />
              Show folder
            </button>
            <button className="hover:bg-science-500" onClick={makeNewProject}>
              <IconAddBoxOutline className="inline size-6 me-1" />
              New Project
            </button>
          </li>

          {projects.length ? projects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))
            :
            <li className="p-4 py-8">
              <p className="text-center text-sm italic opacity-70">No projects found. Create a new project or open the projects folder to add existing ones.</p>
            </li>
          }
        </ul>
      </>
        :
        <>
          <p className="p-4 pt-5">You currently don{"'"}t have any projects, make your first one and it will appear here in a list.</p>

          <button className="hover:bg-science-500 text-xl" onClick={makeNewProject}>
            <IconAddBoxOutline className="inline size-8 me-1" />
            Create First Project
          </button>
        </>
      }
    </main>
  );
}
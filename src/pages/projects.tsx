import { useEffect } from "react";
import { usePageContext } from "../components/page-context/use-page-context";
import ProjectCard from "../components/project-card";
import { getEmptyProject, Project } from "../project-types";
import { IconAddBoxOutline, IconFolderOutline } from "../components/icons";
import { path } from "@tauri-apps/api";
import { appDataDir } from "@tauri-apps/api/path";
import * as fs from "@tauri-apps/plugin-fs";
import { useToast } from "../components/toast/useToast";
import { DirName, FileName } from "../global";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { invoke } from "@tauri-apps/api/core";

export default function Projects() {
  const { toast } = useToast();
  const { setHeaderText, projects, setProjects } = usePageContext();

  useEffect(() => setHeaderText("Projects"), [setHeaderText]);

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      const projectsDir = await path.join(await appDataDir(), DirName.Projects);

      // If it doesn't exist, cancel
      const dirExists = await fs.exists(projectsDir);
      if (!dirExists) return;

      const loadedProjects: Project[] = [];

      // Read folder
      const projectFolderNames = (await fs.readDir(projectsDir)).filter(i => i.isDirectory && !i.name.startsWith(".")).map(d => d.name);
      for (const folderName of projectFolderNames) {
        try {
          const folderPath = await path.join(projectsDir, folderName);
          const saveFilePath = await path.join(folderPath, FileName.ProjectSave);

          const fileExists = await fs.exists(saveFilePath);
          if (!fileExists) {
            console.warn("Project save file does not exist, skipping:", saveFilePath);
            continue;
          }

          const fileContent = await fs.readFile(saveFilePath);
          const decoder = new TextDecoder("utf-8");
          const decodedContent = decoder.decode(fileContent);
          const project: Project = JSON.parse(decodedContent);
          loadedProjects.push(project);
        } catch (e) {
          console.error("Failed to load project file:", folderName, e);
        }
      }

      setProjects(loadedProjects);
    };
    loadProjects();
  }, [setProjects]);

  const showProjectsFolder = async () => {
    const hiddenSubFolderPath = await path.join(await appDataDir(), DirName.Projects, ".target");
    await invoke("mkdir", { dirPath: hiddenSubFolderPath });
    await revealItemInDir(hiddenSubFolderPath);
  };

  const makeNewProject = async () => {
    const newProject = getEmptyProject();
    const projectFolderPath = await path.join(await appDataDir(), DirName.Projects, newProject.id);
    const saveFilePath = await path.join(projectFolderPath, FileName.ProjectSave);

    // Add to state TODO move this after successful save
    setProjects((prev) => [...prev, newProject]);

    await invoke("mkdir", { dirPath: projectFolderPath });

    // Make project save file
    const content = JSON.stringify(newProject, null, 2);
    await fs.create(saveFilePath);
    await fs.writeFile(saveFilePath, new TextEncoder().encode(content))
      .catch((e) => {
        console.error("Failed to write new project file:", e);
        toast("Failed to create new project file. Please try again.");
        return;
      });

    toast(<>
      Made new project.
      {/* Maybe remove this line VVV */}
      {/* Made new project. <a href="" target="_blank" rel="noreferrer" onClick={(e) => { e.preventDefault(); setRoute(PageRoute.Editor); setProjectId(newProject.id); }}>Edit</a> */}
    </>);
  };

  const sortByDateCreated = (a: Project, b: Project) => {
    return b.dateCreated - a.dateCreated;
  };

  return (
    <main className="w-full flex flex-col items-center overflow-y-auto">
      <p className="p-4 pt-5">Load, export or import previous projects or create entirely new ones.</p>

      <ul className="w-11/12 md:w-7/12 flex flex-col gap-y-4 h-full overflow-y-auto pe-4 pt-1.5">
        <li className="w-full flex flex-row justify-end gap-x-3">
          <button className="bg-abyss-200 hover:bg-spore-500" onClick={showProjectsFolder}>
            <IconFolderOutline className="inline size-6 me-1" />
            Show folder
          </button>

          <button className="bg-abyss-200 hover:bg-science-500" onClick={makeNewProject}>
            <IconAddBoxOutline className="inline size-6 me-1" />
            New Project
          </button>
        </li>

        {projects.length ? projects.sort(sortByDateCreated).map((project, index) => (
          <ProjectCard key={index} project={project} />
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
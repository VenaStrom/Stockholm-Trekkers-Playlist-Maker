import { useEffect, useState } from "react";
import { usePageContext } from "../components/page-context/use-page-context";
import { PageRoute } from "../components/page-context/page.internal";
import { path } from "@tauri-apps/api";
import { appDataDir } from "@tauri-apps/api/path";
import { DirName, FileName } from "../global";
import * as fs from "@tauri-apps/plugin-fs";
import { Project } from "../project-types";
import { IconArrowBack2Outline, IconEditOutline, Spinner3DotsScaleMiddle } from "../components/icons";
import { useDebounce } from "use-debounce";
import BlockLi from "../components/editor/block";

export default function Editor() {
  const { setHeaderText, projectId, setRoute } = usePageContext();
  const [volatileProject, setVolatileProject] = useState<Project | null>(null);

  useEffect(() => setHeaderText("Editor"), [setHeaderText]);

  const readProjectData = async () => {
    if (!projectId) return;
    const projectFolderPath = await path.join(await appDataDir(), DirName.Projects, projectId);

    if (!await fs.exists(projectFolderPath)) {
      console.error("Project does not exist:", projectFolderPath);
      setRoute(PageRoute.Projects);
      return;
    }

    const projectSaveFile = await path.join(projectFolderPath, FileName.ProjectSave);

    const fileContent = await fs.readFile(projectSaveFile);
    const decoder = new TextDecoder("utf-8");
    const decodedContent = decoder.decode(fileContent);
    const project = JSON.parse(decodedContent);

    setVolatileProject(project);
  };
  // Read project data from file on mount
  useEffect(() => {
    // Redirect if no project id is defined
    if (!projectId) {
      console.warn("No project id set when trying to open editor.");
      setRoute(PageRoute.Projects);
    }

    readProjectData();
  }, []);

  // Save project data to file when changed
  const debouncedProjectData = useDebounce(volatileProject, 500);
  const writeProjectToFile = async (project: Project) => {
    const projectFolderPath = await path.join(await appDataDir(), DirName.Projects, project.id);

    if (!await fs.exists(projectFolderPath)) {
      console.error("Project folder does not exist:", projectFolderPath);
      return;
    }

    const projectSaveFile = await path.join(projectFolderPath, FileName.ProjectSave);

    const encoder = new TextEncoder();
    const fileContent = encoder.encode(JSON.stringify(project, null, 2));

    await fs.writeFile(projectSaveFile, fileContent);
  };
  useEffect(() => {
    if (!debouncedProjectData[0]) return;
    writeProjectToFile(debouncedProjectData[0]);
  }, [debouncedProjectData]);

  const onDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setVolatileProject(prev => prev ? { ...prev, date: newDate } : prev);
  };

  const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setVolatileProject(prev => prev ? { ...prev, description: newDescription } : prev);
  };

  return (
    <main className="flex flex-col lg:flex-row gap-x-8 gap-y-12 justify-center items-start pt-4 px-12">
      <aside className="min-w-1/4 not-lg:w-full flex flex-col gap-y-4">
        {/* Go back */}
        <button className="w-fit pe-3 ps-1.5 hover:bg-science-500 sticky top-5 shadow-sm"
          onClick={async () => {
            if (volatileProject) await writeProjectToFile(volatileProject); // Save before going back
            setRoute(PageRoute.Projects);
          }}
        >
          <IconArrowBack2Outline className="inline size-6 me-1" />
          Back to Projects
        </button>

        {/* Date */}
        <div className="flex flex-row justify-center items-center">
          <label className="w-fit flex flex-col">
            Date
            <span className="bg-abyss-800 rounded-sm pe-2">
              {!volatileProject ?
                <Spinner3DotsScaleMiddle className="w-fit h-9 inline-block align-middle mb-1" />
                :
                <input
                  onChange={onDateChange}
                  value={volatileProject.date}
                  name="date"
                  className="text-center text-xl"
                  type="text"
                  placeholder="e.g. 2025-11-01"
                />
              }
              <IconEditOutline className="inline-block ml-2 mb-1" />
            </span>
          </label>
        </div>

        {/* Description */}
        <label className="€no-style w-full flex flex-col">
          Description
          {!volatileProject ?
            <span className="bg-abyss-800 rounded-sm h-16 flex flex-col justify-center">
              <Spinner3DotsScaleMiddle className="w-fit h-9 inline-block align-middle mb-1" />
            </span>
            :
            <textarea onChange={onDescriptionChange} value={volatileProject.description || ""} placeholder="Optional description of project."></textarea>
          }
        </label>

        {/* DEBUG TODO - remove */}
        <pre className="opacity-50 text-xs mt-10">
          {JSON.stringify(debouncedProjectData[0]) === JSON.stringify(volatileProject) ? "Saved" : "Saving..."}
          <br />
          {JSON.stringify(volatileProject, null, 2)}
        </pre>
      </aside>

      <section className="lg:flex-1 not-lg:w-full">
        <ul className="flex flex-col gap-y-4 not-lg:pb-52">
          {volatileProject?.blocks.map((block, index) => (
            <BlockLi
              key={`block-${block.id}`}
              block={block}
              blockIndex={index}
              project={volatileProject}
              projectSetter={setVolatileProject}
            />
          ))}
        </ul>
      </section>
    </main>
  );
}
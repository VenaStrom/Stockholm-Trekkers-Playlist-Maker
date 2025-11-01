import { useEffect, useState } from "react";
import { usePageContext } from "../components/page-context/use-page-context";
import { PageRoute } from "../components/page-context/page.internal";
import { path } from "@tauri-apps/api";
import { appDataDir } from "@tauri-apps/api/path";
import { DirName } from "../global";
import * as fs from "@tauri-apps/plugin-fs";
import { Project } from "../project-types";
import { IconArrowBack2Outline, IconEditOutline, Spinner3DotsScaleMiddle } from "../components/icons";
import { useDebounce } from "use-debounce";

export default function Editor() {
  const { setHeaderText, projectId, setRoute } = usePageContext();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => setHeaderText("Editor"), [setHeaderText]);

  // Read project data from file
  useEffect(() => {
    // Redirect if no project id is defined
    if (!projectId) {
      console.warn("No project id set when trying to open editor.");
      setRoute(PageRoute.Projects);
    }

    const fetchProjectData = async () => {
      const projectsDir = await path.join(await appDataDir(), DirName.Projects);
      const filePath = await path.join(projectsDir, `${projectId}.json`);

      if (!await fs.exists(filePath)) {
        console.error("Project file does not exist:", filePath);
        setRoute(PageRoute.Projects);
        return;
      }

      const fileContent = await fs.readFile(filePath);
      const decoder = new TextDecoder("utf-8");
      const decodedContent = decoder.decode(fileContent);
      const project = JSON.parse(decodedContent);

      setProject(project);
    };

    fetchProjectData();
  }, []);

  // Save project data to file when changed
  const debouncedProjectData = useDebounce(project, 500);
  useEffect(() => {
    const saveProjectData = async () => {
      if (!debouncedProjectData[0]) return;
      const projectsDir = await path.join(await appDataDir(), DirName.Projects);
      const filePath = await path.join(projectsDir, `${projectId}.json`);

      const encoder = new TextEncoder();
      const fileContent = encoder.encode(JSON.stringify(debouncedProjectData[0], null, 2));

      await fs.writeFile(filePath, fileContent);
    };

    saveProjectData();
  }, [debouncedProjectData]);

  const onDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setProject(prev => prev ? { ...prev, date: newDate } : prev);
  };

  const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setProject(prev => prev ? { ...prev, description: newDescription } : prev);
  };

  return (
    <main className="flex flex-row gap-x-4 justify-center items-start pt-4">
      <aside className="h-full min-w-1/4 flex flex-col gap-y-4 px-8">
        {/* Go back */}
        <button className="w-fit pe-3 ps-1.5 hover:bg-science-500" onClick={() => setRoute(PageRoute.Projects)}>
          <IconArrowBack2Outline className="inline size-6 me-1" />
          Back to Projects
        </button>

        {/* Date */}
        <div className="flex flex-row justify-center items-center">
          <label className="w-fit flex flex-col">
            Date
            <span className="bg-abyss-800 rounded-sm pe-2">
              {!project ?
                <Spinner3DotsScaleMiddle className="w-fit h-9 inline-block align-middle mb-1" />
                :
                <input
                  onChange={onDateChange}
                  value={project.date}
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
          {!project ?
            <span className="bg-abyss-800 rounded-sm h-16 flex flex-col justify-center">
              <Spinner3DotsScaleMiddle className="w-fit h-9 inline-block align-middle mb-1" />
            </span>
            :
            <textarea onChange={onDescriptionChange} value={project.description || ""} placeholder="Optional description of project."></textarea>
          }
        </label>

        {/* DEBUG TODO - remove */}
        <pre className="opacity-50 text-xs mt-10">
          {JSON.stringify(debouncedProjectData[0]) === JSON.stringify(project) ? "Saved" : "Saving..."}
          <br />
          {JSON.stringify(project, null, 2)}
        </pre>
      </aside>

      <section className="h-full flex-1">
        Blocks
        <ul>

        </ul>
      </section>
    </main>
  );
}
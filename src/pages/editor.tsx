import { useEffect, useState } from "react";
import { usePageContext } from "../components/page-context/use-page-context";
import { PageRoute } from "../components/page-context/page.internal";
import { path } from "@tauri-apps/api";
import { appDataDir } from "@tauri-apps/api/path";
import { DirName } from "../global";
import * as fs from "@tauri-apps/plugin-fs";
import { Project } from "../project-types";
import { IconEditOutline } from "../components/icons";

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


  return (
    <main className="flex flex-row gap-x-4 justify-center items-start">
      <pre className="absolute pointer-events-none top-[25%] left-50% opacity-50 text-xs">{JSON.stringify(project, null, 2)}</pre>

      <form action="h-full min-w-1/4">
        <aside className="h-full w-full flex flex-col gap-y-4 pt-4 px-8">
          <div className="flex flex-row justify-center items-center">
            <label className="w-fit flex flex-col">
              Date
              <span className="bg-abyss-800 rounded-sm pe-2">
                <input
                  className="text-center text-xl px-0"
                  type="text"
                  placeholder="e.g. 2025-11-01"
                />
                <IconEditOutline className="inline-block ml-2 mb-1" />
              </span>
            </label>
          </div>

          <label className="€no-style flex flex-col">
            Description
            <textarea placeholder="Optional description of project."></textarea>
          </label>
        </aside>
      </form>

      <section className="h-full flex-1">
        Main
      </section>
    </main>
  );
}
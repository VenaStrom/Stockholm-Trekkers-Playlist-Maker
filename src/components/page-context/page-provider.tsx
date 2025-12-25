import { useCallback, useEffect, useState } from "react";
import { PageContext, PageContextDefaultValue } from "./page.internal";
import { getAllProjects } from "@/functions/project/get-all-projects";

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState(PageContextDefaultValue.route);
  const [headerText, setHeaderText] = useState(PageContextDefaultValue.headerText);
  const [projectId, setProjectId] = useState(PageContextDefaultValue.projectId);
  const [projects, setProjects] = useState<PageContext["projects"]>([]);

  const [forceReload, setForceReload] = useState(0);
  const reload = useCallback(() => setForceReload((prev) => prev + 1), []);

  useEffect(() => {
    void forceReload; // To satisfy the linter about using the dependency

    getAllProjects()
      .then((loadedProjects) => {
        setProjects(loadedProjects);
      })
      .catch((e) => {
        console.error("Failed to load projects:", e);
      });
  }, [forceReload]);

  const value: PageContext = {
    route,
    setRoute,
    headerText,
    setHeaderText,
    projectId,
    setProjectId,
    projects,
    setProjects,

    reload,
  };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
}
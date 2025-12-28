import { useCallback, useEffect, useState } from "react";
import { PageContext, PageContextDefaultValue } from "@/components/page-context/page.internal";
import { getAllProjectMetas } from "@/functions/project/get-all-projects";

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [route, setInternalRoute] = useState(PageContextDefaultValue.route);
  const [headerText, setHeaderText] = useState(PageContextDefaultValue.headerText);
  const [projectId, setProjectId] = useState(PageContextDefaultValue.projectId);
  const [projectMetas, setProjectMetas] = useState<PageContext["projectMetas"]>([]);

  const [forceReload, setForceReload] = useState(0);
  const reloadProjectMetaData = useCallback(() => setForceReload((prev) => prev + 1 % 9999), []);

  const setRoute = useCallback((arg: Parameters<typeof setInternalRoute>[0]) => {
    setInternalRoute(arg);
    reloadProjectMetaData();
  }, [reloadProjectMetaData]);

  useEffect(() => {
    void forceReload; // To satisfy the linter about using the dependency

    getAllProjectMetas()
      .then((loadedMetas) => {
        setProjectMetas(loadedMetas);
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
    projectMetas,
    setProjectMetas,

    reloadProjectMetaData,
  };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
}
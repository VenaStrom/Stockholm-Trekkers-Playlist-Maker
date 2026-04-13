import { useCallback, useEffect, useState } from "react";
import { PageContext, PageContextDefaultValue } from "@/components/page-context";
import { getAllProjectMetas } from "@/functions/project";
import { PowerKey } from "@/global";

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [route, setInternalRoute] = useState(PageContextDefaultValue.route);
  const [headerText, setHeaderText] = useState(PageContextDefaultValue.headerText);
  const [projectID, setProjectID] = useState(PageContextDefaultValue.projectID);
  const [projectMetas, setProjectMetas] = useState<PageContext["projectMetas"]>([]);
  const [isPowerMode, setIsPowerMode] = useState(PageContextDefaultValue.isPowerMode);

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
      .catch((err: unknown) => {
        console.error("Failed to load projects:", err);
      });
  }, [forceReload]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === PowerKey) setIsPowerMode(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === PowerKey) setIsPowerMode(false);
    };
    const onBlur = () => setIsPowerMode(false);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const value: PageContext = {
    route,
    setRoute,
    headerText,
    setHeaderText,
    projectID: projectID,
    setProjectID: setProjectID,
    projectMetas,
    setProjectMetas,

    isPowerMode,

    reloadProjectMetaData,
  };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
}
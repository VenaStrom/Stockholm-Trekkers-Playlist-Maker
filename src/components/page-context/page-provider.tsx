import { useCallback, useEffect, useState } from "react";
import { PageContext, PageContextDefaultValue } from "@/components/page-context";
import { getAllProjectMetas, type EncodingStrategy } from "@/functions/project";
import { PowerKey } from "@/global";

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [route, setInternalRoute] = useState(PageContextDefaultValue.route);
  const [headerText, setHeaderText] = useState(PageContextDefaultValue.headerText);
  const [projectID, setProjectID] = useState(PageContextDefaultValue.projectID);
  const [projectMetas, setProjectMetas] = useState<PageContext["projectMetas"]>([]);
  const [isPowerMode, setIsPowerMode] = useState(PageContextDefaultValue.isPowerMode);

  const [autosave, setAutosave] = useState(() => {
    const stored = localStorage.getItem("autosave");
    return stored === null ? PageContextDefaultValue.autosave : stored === "true";
  });
  useEffect(() => {
    localStorage.setItem("autosave", String(autosave));
  }, [autosave]);

  // Default ON: the current playback computer only hardware-decodes H.264.
  // Kept as a setting so it's easy to switch off after a hardware upgrade.
  const [warnOnNonH264, setWarnOnNonH264] = useState(() => {
    const stored = localStorage.getItem("warnOnNonH264");
    return stored === null ? PageContextDefaultValue.warnOnNonH264 : stored === "true";
  });
  useEffect(() => {
    localStorage.setItem("warnOnNonH264", String(warnOnNonH264));
  }, [warnOnNonH264]);

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

  // Chosen on the export confirmation; remembered so the editor can skip
  // codec warnings that the export would fix anyway
  const [exportEncoding, setExportEncoding] = useState<EncodingStrategy>(() => {
    const stored = localStorage.getItem("exportEncoding");
    if (stored === "preserve" || stored === "h264" || stored === "hevc") return stored;
    return PageContextDefaultValue.exportEncoding;
  });
  useEffect(() => {
    localStorage.setItem("exportEncoding", exportEncoding);
  }, [exportEncoding]);

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

    autosave,
    setAutosave,

    warnOnNonH264,
    setWarnOnNonH264,

    exportEncoding,
    setExportEncoding,

    reloadProjectMetaData,
  };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
}
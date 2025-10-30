import { useState } from "react";
import { PageContext, PageContextDefaultValue } from "./page.internal";

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState(PageContextDefaultValue.route);
  const [headerText, setHeaderText] = useState(PageContextDefaultValue.headerText);
  const [projectId, setProjectId] = useState(PageContextDefaultValue.projectId);
  const [projects, setProjects] = useState<PageContext["projects"]>([]);

  const value: PageContext = {
    route,
    setRoute,
    headerText,
    setHeaderText,
    projectId,
    setProjectId,
    projects,
    setProjects,
  };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
}
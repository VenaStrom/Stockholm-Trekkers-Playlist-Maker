import { createContext } from "react";
import { Project } from "../../types";

export const PageRoute = {
  Projects: "projects",
  Editor: "editor",
} as const;
export type PageRoute = (typeof PageRoute)[keyof typeof PageRoute];

export type PageContext = {
  route: PageRoute;
  setRoute: (route: PageRoute) => void;
  headerText: string;
  setHeaderText: (text: string) => void;
  projectId: string | null;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
};
export const PageContextDefaultValue: PageContext = {
  route: PageRoute.Projects,
  setRoute: () => { },
  headerText: "",
  setHeaderText: () => { },
  projectId: null,
  projects: [],
  setProjects: () => { },
};

export const PageContext = createContext<PageContext>({ ...PageContextDefaultValue });

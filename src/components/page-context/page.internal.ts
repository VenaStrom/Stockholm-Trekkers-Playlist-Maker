import React, { createContext } from "react";
import { Project } from "../../project-types";

export const PageRoute = {
  Projects: "projects",
  Editor: "editor",
} as const;
export type PageRoute = (typeof PageRoute)[keyof typeof PageRoute];

export type PageContext = {
  route: PageRoute;
  setRoute: React.Dispatch<React.SetStateAction<PageRoute>>;
  headerText: string;
  setHeaderText: React.Dispatch<React.SetStateAction<string>>;
  projectId: string | null;
  setProjectId: React.Dispatch<React.SetStateAction<string | null>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
};
export const PageContextDefaultValue: PageContext = {
  route: PageRoute.Projects,
  setRoute: () => { },
  headerText: "",
  setHeaderText: () => { },
  projectId: null,
  setProjectId: () => { },
  projects: [],
  setProjects: () => { },
};

export const PageContext = createContext<PageContext>({ ...PageContextDefaultValue });

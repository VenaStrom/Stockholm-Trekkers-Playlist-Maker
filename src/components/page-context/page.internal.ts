import React, { createContext } from "react";
import { ProjectMeta } from "@/types";

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
  projectMetas: ProjectMeta[];
  setProjectMetas: React.Dispatch<React.SetStateAction<ProjectMeta[]>>;

  reloadProjectMetaData: () => void;
};
export const PageContextDefaultValue: PageContext = {
  route: PageRoute.Projects,
  setRoute: () => { /* will be defined */ },
  headerText: "",
  setHeaderText: () => { /* will be defined */ },
  projectId: null,
  setProjectId: () => { /* will be defined */ },
  projectMetas: [],
  setProjectMetas: () => { /* will be defined */ },

  reloadProjectMetaData: () => { /* will be defined */ },
};

export const PageContext = createContext<PageContext>({ ...PageContextDefaultValue });

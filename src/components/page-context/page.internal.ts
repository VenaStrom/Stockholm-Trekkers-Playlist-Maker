import type React from "react";
import { createContext } from "react";
import type { ProjectMeta } from "@/types";

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
  projectID: string | null;
  setProjectID: React.Dispatch<React.SetStateAction<string | null>>;
  projectMetas: ProjectMeta[];
  setProjectMetas: React.Dispatch<React.SetStateAction<ProjectMeta[]>>;

  isPowerMode: boolean;

  /** Save the open project automatically shortly after every change */
  autosave: boolean;
  setAutosave: React.Dispatch<React.SetStateAction<boolean>>;

  /** Warn in the editor when an episode is not H.264 — the only codec the playback computer hardware-decodes */
  warnOnNonH264: boolean;
  setWarnOnNonH264: React.Dispatch<React.SetStateAction<boolean>>;

  reloadProjectMetaData: () => void;
};
export const PageContextDefaultValue: PageContext = {
  route: PageRoute.Projects,
  setRoute: () => { /* will be defined */ },
  headerText: "",
  setHeaderText: () => { /* will be defined */ },
  projectID: null,
  setProjectID: () => { /* will be defined */ },
  projectMetas: [],
  setProjectMetas: () => { /* will be defined */ },

  isPowerMode: false,

  autosave: true,
  setAutosave: () => { /* will be defined */ },

  warnOnNonH264: true,
  setWarnOnNonH264: () => { /* will be defined */ },

  reloadProjectMetaData: () => { /* will be defined */ },
};

export const PageContext = createContext<PageContext>({ ...PageContextDefaultValue });

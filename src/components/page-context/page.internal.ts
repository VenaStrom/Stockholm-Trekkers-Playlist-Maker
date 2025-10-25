import { createContext } from "react";

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
};
export const PageContextDefaultValue: PageContext = {
  route: PageRoute.Projects,
  setRoute: () => { },
  headerText: "",
  setHeaderText: () => { },
  projectId: null,
};

export const PageContext = createContext<PageContext>({ ...PageContextDefaultValue });

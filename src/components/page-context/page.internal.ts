import { createContext } from "react";

export const PageRoutes = {
  Projects: "projects",
  Editor: "editor",
} as const;
export type PageRoutes = (typeof PageRoutes)[keyof typeof PageRoutes];

export type PageContext = {
  route: PageRoutes;
  setRoute: (route: string) => void;
  headerText: string;
  setHeaderText: (text: string) => void;
};
export const PageContextDefaultValue: PageContext = {
  route: PageRoutes.Projects,
  setRoute: () => { },
  headerText: "",
  setHeaderText: () => { },
};

export const PageContext = createContext<PageContext>({ ...PageContextDefaultValue });

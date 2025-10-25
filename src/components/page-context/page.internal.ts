import { createContext } from "react";

export type PageContext = {
  headerText: string;
  setHeaderText: (text: string) => void;
};

export const PageContext = createContext<PageContext | null>(null);

import { useContext } from "react";
import { PageContext } from "@/components/page-context";

export function usePageContext(): PageContext {
  return useContext(PageContext);
}

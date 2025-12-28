import { useContext } from "react";
import { PageContext } from "@/components/page-context/page.internal";

export function usePageContext(): PageContext {
  const ctx = useContext(PageContext);
  if (!ctx) throw new Error("usePageContext must be used within a page context provider");
  return ctx;
}

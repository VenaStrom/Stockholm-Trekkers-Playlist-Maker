import { useState } from "react";
import { PageContext } from "./page.internal";

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [headerText, setHeaderText] = useState("");

  return (
    <PageContext.Provider value={{
      headerText,
      setHeaderText,
    }}>
      {children}
    </PageContext.Provider>
  );
}
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import { PageProvider } from "./components/page-context/page";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PageProvider>
      <App />
    </PageProvider>
  </StrictMode>
);

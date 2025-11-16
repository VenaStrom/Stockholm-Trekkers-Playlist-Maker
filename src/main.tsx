import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import { PageProvider } from "./components/page-context/page";
import { ToastProvider } from "./components/toast/toast";

const root = document.getElementById("root");
if (!root) throw new Error("Failed to find root element");
createRoot(root).render(
  <StrictMode>
    <PageProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </PageProvider>
  </StrictMode>
);

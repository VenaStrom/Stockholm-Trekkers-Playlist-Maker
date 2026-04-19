import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PageProvider } from "@/components/page-context";
import { ToastProvider } from "@/components/toast";
import App from "@/app";

const root = document.getElementById("root");
if (!root) throw new Error("Failed to find root element");
createRoot(root).render(
  <StrictMode>
    <PageProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </PageProvider>
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { attachConsole } from "@tauri-apps/plugin-log";
import { PageProvider } from "@/components/page-context";
import { ToastProvider } from "@/components/toast";
import App from "@/app";

const bootstrap = async () => {
  try {
    await attachConsole();
  } catch (error) {
    console.warn("Failed to attach Tauri console logger", error);
  }

  window.addEventListener("error", (event) => {
    console.error("window error", event.error ?? event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("unhandled rejection", event.reason);
  });

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
};

bootstrap()
  .catch((e: unknown) => {
    console.error("Failed to bootstrap application", e);
    alert("An unexpected error occurred while starting the application. Please check the console for details.");
  });
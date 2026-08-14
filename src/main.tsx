import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { debug as tauriDebug, error as tauriError, info as tauriInfo, trace as tauriTrace, warn as tauriWarn } from "@tauri-apps/plugin-log";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { PageProvider } from "@/components/page-context";
import { ToastProvider } from "@/components/toast";
import { maybeRunCliMode } from "@/functions/cli";
import App from "@/app";

const formatLogValue = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value instanceof Error) return `${value.name}: ${value.message}${value.stack ? `\n${value.stack}` : ""}`;

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const installConsoleForwarder = () => {
  const original = {
    log: console.log.bind(console),
    debug: console.debug.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  let forwardEnabled = true;
  const forward = (level: "trace" | "debug" | "info" | "warn" | "error", args: unknown[]) => {
    if (!forwardEnabled) return;

    const message = args.map(formatLogValue).join(" ");
    void (async () => {
      try {
        if (level === "trace") await tauriTrace(message);
        if (level === "debug") await tauriDebug(message);
        if (level === "info") await tauriInfo(message);
        if (level === "warn") await tauriWarn(message);
        if (level === "error") await tauriError(message);
      } catch {
        forwardEnabled = false;
        original.warn("Console forwarding to Tauri log disabled after first failure.");
      }
    })();
  };

  console.log = (...args: unknown[]) => {
    original.log(...args);
    forward("info", args);
  };

  console.debug = (...args: unknown[]) => {
    original.debug(...args);
    forward("debug", args);
  };

  console.info = (...args: unknown[]) => {
    original.info(...args);
    forward("info", args);
  };

  console.warn = (...args: unknown[]) => {
    original.warn(...args);
    forward("warn", args);
  };

  console.error = (...args: unknown[]) => {
    original.error(...args);
    forward("error", args);
  };
};

const bootstrap = async () => {
  installConsoleForwarder();

  window.addEventListener("error", (event) => {
    console.error("window error", event.error ?? event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("unhandled rejection", event.reason);
  });

  const didRunCli = await maybeRunCliMode();
  if (didRunCli) return;

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

  await getCurrentWindow().show().catch((e: unknown) => {
    console.error("Failed to show app window.", e);
  });
};

void bootstrap().catch((e: unknown) => {
  console.error("Failed to bootstrap application", e);
  alert("An unexpected error occurred while starting the application. Please check the console for details.");
});
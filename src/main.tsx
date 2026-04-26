import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  debug as tauriDebug,
  error as tauriError,
  info as tauriInfo,
  trace as tauriTrace,
  warn as tauriWarn,
} from "@tauri-apps/plugin-log";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { PageProvider } from "@/components/page-context";
import { ToastProvider } from "@/components/toast";
import { exportProject } from "@/functions/project";
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

type CliExportArgs = {
  projectID: string;
  saveLocation: string;
};

const parseExportArgs = (argv: string[]): CliExportArgs | null => {
  const tokens = argv.slice(1);
  if (tokens[0] !== "export") return null;

  let projectID = "";
  let saveLocation = "";

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i] ?? "";
    const next = tokens[i + 1] ?? "";

    if (token === "--project-id" || token === "--project" || token === "--id" || token === "-p") {
      projectID = next;
      i++;
      continue;
    }

    if (token.startsWith("--project-id=")) {
      projectID = token.split("=", 2)[1] ?? "";
      continue;
    }

    if (token === "--out" || token === "--output" || token === "-o") {
      saveLocation = next;
      i++;
      continue;
    }

    if (token.startsWith("--out=") || token.startsWith("--output=")) {
      saveLocation = token.split("=", 2)[1] ?? "";
      continue;
    }
  }

  if (!projectID || !saveLocation) {
    throw new Error("Missing CLI args. Usage: app export --project-id <id> --out <folder>");
  }

  return { projectID, saveLocation };
};

const maybeRunCliExportMode = async (): Promise<boolean> => {
  let argv: string[];
  try {
    argv = await invoke<string[]>("get_cli_args");
  } catch {
    return false;
  }

  if (!Array.isArray(argv) || argv.length < 2) return false;

  const requestedExport = argv.slice(1).includes("export");

  try {
    const parsed = parseExportArgs(argv);
    if (!parsed) return false;

    console.info(`CLI export start: projectID=${parsed.projectID}, out=${parsed.saveLocation}`);
    await exportProject(parsed.projectID, parsed.saveLocation);
    console.info("CLI export finished successfully.");
  } catch (e: unknown) {
    if (!requestedExport) return false;
    console.error("CLI export failed.", e);
  }

  await invoke("close").catch((e: unknown) => {
    console.error("Failed to close app after CLI export.", e);
  });

  return true;
};

const bootstrap = async () => {
  installConsoleForwarder();

  window.addEventListener("error", (event) => {
    console.error("window error", event.error ?? event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("unhandled rejection", event.reason);
  });

  const didRunCliExport = await maybeRunCliExportMode();
  if (didRunCliExport) return;

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
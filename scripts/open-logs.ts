import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const identifier = "com.stockholm-trekkers.playlist-maker";

const getLogsDir = () => {
  const home = homedir();

  if (process.platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA ?? path.join(home, "AppData", "Local");
    return path.join(localAppData, identifier, "logs");
  }

  if (process.platform === "darwin") {
    return path.join(home, "Library", "Logs", identifier);
  }

  const xdgDataHome = process.env.XDG_DATA_HOME ?? path.join(home, ".local", "share");
  return path.join(xdgDataHome, identifier, "logs");
};

const getOpenCommand = () => {
  if (process.platform === "win32") return "explorer";
  if (process.platform === "darwin") return "open";
  return "xdg-open";
};

const logsDir = getLogsDir();
mkdirSync(logsDir, { recursive: true });

const command = getOpenCommand();
const child = spawn(command, [logsDir], { stdio: "inherit" });

child.on("error", (error) => {
  console.error(`Failed to open logs directory: ${logsDir}`);
  console.error(error);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

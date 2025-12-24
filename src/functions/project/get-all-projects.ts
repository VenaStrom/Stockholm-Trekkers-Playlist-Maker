import { PathName } from "@/global";
import * as fs from "@tauri-apps/plugin-fs";

export async function getAllProjects(): Promise<string[]> {
  if (!await fs.exists(PathName.UserProjectsDir)) {
    await fs.mkdir(PathName.UserProjectsDir, { recursive: true });
    return [];
  }

  const entries = await fs.readDir(PathName.UserProjectsDir);
  const projectIds = entries
    .filter(entry => entry.isDirectory)
    .filter(entry => !entry.name.startsWith("."))
    .map(entry => entry.name);

  return projectIds;
}
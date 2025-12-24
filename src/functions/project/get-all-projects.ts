import { FileName, PathName } from "@/global";
import { path } from "@tauri-apps/api";
import * as fs from "@tauri-apps/plugin-fs";

export async function getAllProjects(): Promise<Set<string>> {
  if (!await fs.exists(PathName.UserProjectsDir)) {
    await fs.mkdir(PathName.UserProjectsDir, { recursive: true });
    return new Set();
  }

  const entries = await fs.readDir(PathName.UserProjectsDir);
  const foundDirs = entries
    .filter(entry => entry.isDirectory)
    .filter(entry => !entry.name.startsWith("."))
    .map(entry => entry.name);

  // Look for the project save file in each directory
  const validProjects: string[] = [];
  for (const foundDirName of foundDirs) {
    const projectFilePath = await path.join(
      PathName.UserProjectsDir,
      foundDirName,
      FileName.ProjectDB
    );
    if (await fs.exists(projectFilePath)) {
      validProjects.push(foundDirName);
    }
  }

  // Dupe check
  if (validProjects.length !== new Set(validProjects).size) {
    throw new Error("Duplicate project IDs found in project directory. Please resolve manually.");
  }

  return new Set(validProjects);
}
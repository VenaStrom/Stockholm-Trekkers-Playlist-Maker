import * as fs from "@tauri-apps/plugin-fs";
import { PathName } from "@/global";
import { path } from "@tauri-apps/api";

export async function deleteProject(projectId: string): Promise<void> {
  const projectPath = await path.join(
    PathName.UserProjectsDir,
    projectId
  );
  return fs.remove(projectPath, { recursive: true });
}
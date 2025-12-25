import * as fs from "@tauri-apps/plugin-fs";
import { PathName } from "@/global";
import { path } from "@tauri-apps/api";

export async function deleteProject(projectId: string): Promise<void> {
  const projectPath = await path.join(PathName.UserProjectsDir, projectId);

  if (!await fs.exists(projectPath)) {
    throw new Error(`Project with ID ${projectId} does not exist at path: ${projectPath}`);
  }

  return fs.remove(projectPath, { recursive: true });
}
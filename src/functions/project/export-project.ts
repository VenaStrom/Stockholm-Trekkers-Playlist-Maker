import { openProject } from "@/functions/project";
import { path } from "@tauri-apps/api";
import * as fs from "@tauri-apps/plugin-fs";

export async function exportProject(projectID: string, saveLocation: string): Promise<void> {
  if (!projectID || !saveLocation) {
    throw new Error("Project ID and save location must be provided for export.");
  }
  console.info(`Exporting project ${projectID}...`);
  const project = await openProject(projectID);
  console.info(`Read project data for ${project.date} ${projectID}.`);

  // TODO: overwrite logic
  const saveDir = await path.join(saveLocation, project.date);
  await fs.mkdir(saveDir, { recursive: true });
  console.info(`Made export dir at ${saveDir}.`);

  

  return;
}
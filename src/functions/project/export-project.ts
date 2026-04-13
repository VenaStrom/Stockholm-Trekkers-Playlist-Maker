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

  // Make "episodes", and "save-files" sub dirs
  const episodesDir = await path.join(saveDir, "episodes");
  const saveFilesDir = await path.join(saveDir, "save-files");
  await fs.mkdir(episodesDir, { recursive: true });
  await fs.mkdir(saveFilesDir, { recursive: true });
  console.info(`Made sub dirs at ${episodesDir} and ${saveFilesDir}.`);

  return;
}
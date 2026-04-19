import { openProject } from "@/functions/project";
import { ExportNames } from "@/global";
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
  const saveDir = await path.join(saveLocation, project.date || `playlist-missing-date_id-${projectID}`);
  await fs.mkdir(saveDir, { recursive: true });
  console.info(`Made export dir at ${saveDir}.`);

  // Make "episodes", and "save-files" sub dirs
  const episodesDir = await path.join(saveDir, ExportNames.EpisodeDir);
  const saveFilesDir = await path.join(saveDir, ExportNames.SaveDir);
  await fs.mkdir(episodesDir, { recursive: true });
  await fs.mkdir(saveFilesDir, { recursive: true });
  console.info(`Made sub dirs at ${episodesDir} and ${saveFilesDir}.`);

  // Save project data to "save-files" sub dir
  const projectDataPath = await path.join(saveFilesDir, ExportNames.SaveFile);
  await fs.writeTextFile(projectDataPath, JSON.stringify(project));
  console.info(`Saved project data to ${projectDataPath}.`);

  // Copy episode files to "episodes" sub dir
  const copyJobs: Promise<void>[] = [];
  for (const episode of project.episodes) {
    if (!episode.filePath) {
      console.warn(`Episode ${episode.id} is missing filePath. Skipping copy for this episode.`, episode);
      continue;
    }

    const episodeFileName = await path.basename(episode.filePath);
    const destPath = await path.join(episodesDir, episodeFileName);

    console.info("Making copy job for episode file from", episode.filePath, "to", destPath, episode);
    copyJobs.push(fs.copyFile(episode.filePath, destPath)
      .then(() => {
        console.info(`Copied episode file from ${episode.filePath} to ${destPath}.`);
      })
      .catch((e: unknown) => {
        console.error(`Failed to copy episode file from ${episode.filePath} to ${destPath}.`, e);
      }));
  }

  await Promise.all(copyJobs);
  console.info(`Finished exporting project ${projectID} to ${saveDir}.`);
}
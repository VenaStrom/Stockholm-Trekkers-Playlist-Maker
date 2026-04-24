import { openProject } from "@/functions/project";
import { ExportNames, PathName } from "@/global";
import type { Project } from "@/types";
import { path } from "@tauri-apps/api";
import * as fs from "@tauri-apps/plugin-fs";

export async function exportProject(projectID: string, saveLocation: string): Promise<void> {
  if (!projectID || !saveLocation) throw new Error("Project ID and save location must be provided for export.");

  console.info(`Exporting project ${projectID}...`);

  const project = await openProject(projectID);
  console.info(`Read project data for ${project.date} ${projectID}.`);

  // TODO: overwrite logic
  const saveDir = await path.join(saveLocation, project.date || `playlist-missing-date_id-${projectID}`);
  await fs.mkdir(saveDir, { recursive: true }); // TODO: technically a redundant call due to later mkdir?
  console.info(`Made export dir at ${saveDir}.`);

  // Make "episodes", and "save-files" sub dirs
  const [
    episodesDir,
    saveFilesDir,
    clipsDir,
  ] = await Promise.all([
    makeDirRecursive(saveDir, ExportNames.EpisodeDir),
    makeDirRecursive(saveDir, ExportNames.SaveDir),
    makeDirRecursive(saveDir, ExportNames.ClipsDir),
  ]);
  console.info(`Made sub dirs at ${episodesDir}, ${saveFilesDir}, and ${clipsDir}.`);

  // Copy assets
  await Promise.all([
    copyProjectFile(project, saveFilesDir),
    copyEpisodes(project, episodesDir),
    copyClips(project, clipsDir),
  ]);
  console.info(`Finished copying assets for project ${projectID}.`);

  console.info(`Finished exporting project ${projectID} to ${saveDir}.`);
}

async function makeDirRecursive(baseDir: string, dir: string): Promise<string> {
  const newDir = await path.join(baseDir, dir);
  await fs.mkdir(newDir, { recursive: true });
  return newDir;
}

async function copyProjectFile(project: Project, exportDir: string): Promise<void> {
  const projectDataPath = await path.join(exportDir, ExportNames.SaveFile);
  await fs.writeTextFile(projectDataPath, JSON.stringify(project));
  console.info(`Saved project data to ${projectDataPath}.`);
}

async function copyEpisodes(project: Project, exportDir: string): Promise<void[]> {
  const copyJobs: Promise<void>[] = [];

  for (const episode of project.episodes) {
    if (!episode.filePath) {
      console.warn(`Episode ${episode.id} is missing filePath. Skipping copy for this episode.`, episode);
      continue;
    }

    const episodeFileName = await path.basename(episode.filePath);
    const destPath = await path.join(exportDir, episodeFileName);

    console.info("Making copy job for episode file from", episode.filePath, "to", destPath, episode); // Kinda messy log but if something fails I wanna know about it
    copyJobs.push(fs.copyFile(episode.filePath, destPath)
      .then(() => {
        console.info(`Copied episode file from ${episode.filePath} to ${destPath}.`);
      })
      .catch((e: unknown) => {
        console.error(`Failed to copy episode file from ${episode.filePath} to ${destPath}.`, e);
      }));
  }

  return await Promise.all(copyJobs);
}

async function copyClips(_project: Project, exportDir: string): Promise<void[]> {
  // TODO: filter which clips should be copied based on project options

  const sourceFiles = (await fs.readDir(PathName.ClipsDir))
    .map(f => f.isFile ? f.name : null)
    .filter((n): n is string => typeof n === "string");

  const copyJobs: Promise<void>[] = [];

  for (const fileName of sourceFiles) {
    const sourcePath = await path.join(PathName.ClipsDir, fileName);
    const destPath = await path.join(exportDir, fileName);

    console.info("Making copy job for clip file from", sourcePath, "to", destPath); // Kinda messy log but if something fails I wanna know about it
    copyJobs.push(fs.copyFile(sourcePath, destPath)
      .then(() => {
        console.info(`Copied clip file from ${sourcePath} to ${destPath}.`);
      })
      .catch((e: unknown) => {
        console.error(`Failed to copy clip file from ${sourcePath} to ${destPath}.`, e);
      }));
  }

  return await Promise.all(copyJobs);
}
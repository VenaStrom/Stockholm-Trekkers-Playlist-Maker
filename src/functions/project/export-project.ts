import { deepCopy } from "@/functions/deep-copy";
import { openProject } from "@/functions/project";
import { makePlayFiles } from "@/functions/project/export/play-file";
import { hhmmToSeconds } from "@/functions/project/time-format";
import { basicPauseClipFileName, blockClips, ExportNames, PathName } from "@/global";
import type { Episode, Project } from "@/types";
import { path } from "@tauri-apps/api";
import * as fs from "@tauri-apps/plugin-fs";

export type ExportProgress = {
  message: string;
  /** Fraction of completed work between 0 and 1, or null when indeterminate */
  fraction: number | null;
};

export type ExportOptions = {
  /** Replace an existing export folder instead of throwing ExportOverwriteRequiredError */
  overwrite?: boolean;
  onProgress?: (progress: ExportProgress) => void;
  signal?: AbortSignal;
};

/** The project fails one or more of the pre-export checks; see `problems` */
export class ExportValidationError extends Error {
  readonly problems: string[];
  constructor(problems: string[]) {
    super(`Project is not ready to export:\n- ${problems.join("\n- ")}`);
    this.name = "ExportValidationError";
    this.problems = problems;
  }
}

/** The export folder already exists; retry with `overwrite: true` to replace it */
export class ExportOverwriteRequiredError extends Error {
  readonly saveDir: string;
  constructor(saveDir: string) {
    super(`Export folder already exists: ${saveDir}`);
    this.name = "ExportOverwriteRequiredError";
    this.saveDir = saveDir;
  }
}

export class ExportCancelledError extends Error {
  constructor() {
    super("Export cancelled.");
    this.name = "ExportCancelledError";
  }
}

/**
 * Checks that a project can produce a complete, playable export.
 * Returns a list of user-readable problems; empty means the project is good to go.
 */
export async function validateProjectForExport(project: Project): Promise<string[]> {
  const problems: string[] = [];

  if (!project.date.trim()) {
    problems.push("The project has no date set. The date names the export folder.");
  }

  const filledEpisodes = project.episodes.filter((e): e is Project["episodes"][number] & { filePath: string; } => !!e.filePath);
  if (filledEpisodes.length === 0) {
    problems.push("The project has no episodes with files.");
  }

  for (const episode of filledEpisodes) {
    if (!await fs.exists(episode.filePath)) {
      problems.push(`Episode file is missing on disk: ${episode.filePath}`);
    }
  }

  // Episodes are exported by file name, so two different files sharing a name would silently collide
  const pathByFileName = new Map<string, string>();
  for (const episode of filledEpisodes) {
    const fileName = await path.basename(episode.filePath);
    const existingPath = pathByFileName.get(fileName);
    if (existingPath && existingPath !== episode.filePath) {
      problems.push(`Two different files share the name "${fileName}". Rename one of them: ${existingPath} and ${episode.filePath}`);
    }
    else {
      pathByFileName.set(fileName, episode.filePath);
    }
  }

  // Blocks without a valid start time are skipped by the generated play files
  project.blocks.forEach((block, index) => {
    const hasEpisodes = filledEpisodes.some(e => e.blockID === block.id);
    if (!hasEpisodes) return;
    if (!block.startTime || hhmmToSeconds(block.startTime) === null) {
      problems.push(`Block ${index + 1} has no valid start time, so it would be skipped during playback.`);
    }
  });

  return problems;
}

export async function exportProject(projectID: string, saveLocation: string, options: ExportOptions = {}): Promise<string> {
  if (!projectID || !saveLocation) throw new Error("Project ID and save location must be provided for export.");
  const { overwrite = false, onProgress, signal } = options;
  const throwIfCancelled = () => {
    if (signal?.aborted) throw new ExportCancelledError();
  };

  console.info(`Exporting project ${projectID}...`);

  onProgress?.({ message: "Validating project...", fraction: null });
  const project = await openProject(projectID);
  console.info(`Read project data for ${project.date} ${projectID}.`);

  const problems = await validateProjectForExport(project);
  if (problems.length > 0) throw new ExportValidationError(problems);
  throwIfCancelled();

  const saveDir = await path.join(saveLocation, project.date);
  if (await fs.exists(saveDir)) {
    if (!overwrite) throw new ExportOverwriteRequiredError(saveDir);
    onProgress?.({ message: "Removing existing export folder...", fraction: null });
    await fs.remove(saveDir, { recursive: true });
    console.info(`Removed existing export dir at ${saveDir}.`);
  }

  try {
    onProgress?.({ message: "Preparing folders...", fraction: 0 });
    await fs.mkdir(saveDir, { recursive: true });
    console.info(`Made export dir at ${saveDir}.`);

    // Make "episodes", "save-files", and "clips" sub dirs
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

    // Copy files one at a time so progress is reportable and cancellation has clean seams
    const copyJobs = [
      ...await planEpisodeCopies(project, episodesDir),
      ...await planClipCopies(project, clipsDir),
    ];
    const totalSteps = copyJobs.length + 2; // +2 for the save file and play files
    let doneSteps = 0;

    for (const job of copyJobs) {
      throwIfCancelled();
      onProgress?.({
        message: `Copying file ${doneSteps + 1} of ${copyJobs.length}: ${job.label}`,
        fraction: doneSteps / totalSteps,
      });
      await fs.copyFile(job.source, job.dest);
      console.info(`Copied file from ${job.source} to ${job.dest}.`);
      doneSteps++;
    }

    throwIfCancelled();
    onProgress?.({ message: "Writing project save file...", fraction: doneSteps / totalSteps });
    await copyProjectFile(project, saveFilesDir);
    doneSteps++;

    throwIfCancelled();
    onProgress?.({ message: "Writing play scripts...", fraction: doneSteps / totalSteps });
    await copyPlayFiles(project, saveDir);

    onProgress?.({ message: "Export complete.", fraction: 1 });
    console.info(`Finished exporting project ${projectID} to ${saveDir}.`);
    return saveDir;
  }
  catch (err) {
    // Don't leave a half-written export behind
    console.warn(`Export of project ${projectID} did not finish. Removing partial export at ${saveDir}.`);
    await fs.remove(saveDir, { recursive: true })
      .catch((cleanupErr: unknown) => {
        console.error(`Failed to clean up partial export at ${saveDir}:`, cleanupErr);
      });
    throw err;
  }
}

type CopyJob = { source: string; dest: string; label: string; };

async function planEpisodeCopies(project: Project, exportDir: string): Promise<CopyJob[]> {
  // Keyed by file name: the same file used twice is only copied once,
  // and validation guarantees distinct files never share a name
  const jobs = new Map<string, CopyJob>();

  for (const episode of project.episodes) {
    if (!episode.filePath) continue;

    const fileName = await path.basename(episode.filePath);
    if (jobs.has(fileName)) continue;

    jobs.set(fileName, {
      source: episode.filePath,
      dest: await path.join(exportDir, fileName),
      label: fileName,
    });
  }

  return [...jobs.values()];
}

async function planClipCopies(project: Project, exportDir: string): Promise<CopyJob[]> {
  const usedIDs = [...new Set<string>(project.blocks.flatMap(b => Object.entries(b.options).filter(([_, enabled]) => enabled).map(([id]) => id.split("__")[1])).filter((id): id is string => typeof id === "string"))];
  const usedClips = deepCopy(blockClips.filter(c => usedIDs.includes(c.id)));

  const sourceFiles = (await fs.readDir(PathName.ClipsDir))
    .map(f => f.isFile ? f.name : null)
    .filter(n => !!n && (
      n.endsWith(basicPauseClipFileName)
      || usedClips.some(c => c.file.endsWith(n))
    ))
    .filter((n): n is string => typeof n === "string");

  const jobs: CopyJob[] = [];
  for (const fileName of sourceFiles) {
    jobs.push({
      source: await path.join(PathName.ClipsDir, fileName),
      dest: await path.join(exportDir, fileName),
      label: fileName,
    });
  }

  return jobs;
}

async function makeDirRecursive(baseDir: string, dir: string): Promise<string> {
  const newDir = await path.join(baseDir, dir);
  await fs.mkdir(newDir, { recursive: true });
  return newDir;
}

async function copyProjectFile(project: Project, exportDir: string): Promise<void> {
  // Episode paths are rewritten relative to the bundle root so the save file is
  // self-contained: importing it on another computer recomputes absolute paths
  // from wherever the bundle sits. Probe caches are dropped so the importing
  // machine probes the copied files fresh instead of trusting stale metadata.
  const portableEpisodes: Episode[] = [];
  for (const episode of project.episodes) {
    if (!episode.filePath) {
      portableEpisodes.push(episode);
      continue;
    }
    const fileName = await path.basename(episode.filePath);
    portableEpisodes.push({
      id: episode.id,
      blockID: episode.blockID,
      filePath: `./${ExportNames.EpisodeDir}/${fileName}`,
    });
  }
  const portableProject: Project = { ...project, episodes: portableEpisodes };

  const projectDataPath = await path.join(exportDir, ExportNames.SaveFile);
  await fs.writeTextFile(projectDataPath, JSON.stringify(portableProject));
  console.info(`Saved project data to ${projectDataPath}.`);
}

async function copyPlayFiles(project: Project, exportDir: string): Promise<void[]> {
  const playFiles = makePlayFiles(project);

  const [
    playFileShPath,
    playFilePs1Path,
  ] = await Promise.all([
    path.join(exportDir, ExportNames.PlayFileSh),
    path.join(exportDir, ExportNames.PlayFilePs1),
  ]);

  return await Promise.all([
    fs.writeTextFile(playFileShPath, playFiles.sh),
    fs.writeTextFile(playFilePs1Path, playFiles.ps1),
  ]);
}

import { deepCopy } from "@/functions/deep-copy";
import { openProject } from "@/functions/project";
import { makePlayFiles } from "@/functions/project/export/play-file";
import { hhmmToSeconds } from "@/functions/project/time-format";
import { basicPauseClipFileName, blockClips, ExportNames, PathName } from "@/global";
import type { Episode, Project } from "@/types";
import { path } from "@tauri-apps/api";
import { Channel, invoke } from "@tauri-apps/api/core";
import * as fs from "@tauri-apps/plugin-fs";

export type ExportProgress = {
  message: string;
  /** Fraction of completed work between 0 and 1, or null when indeterminate */
  fraction: number | null;
};

export type ExportOptions = {
  /** Replace an existing export folder instead of throwing ExportOverwriteRequiredError */
  overwrite?: boolean;
  /** Pack the whole bundle into a single .zip archive instead of a folder */
  zip?: boolean;
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

export async function exportProject(projectID: string, saveLocation: string, options: ExportOptions = {}): Promise<{ saveDir: string; exportedBytes: number; }> {
  if (!projectID || !saveLocation) throw new Error("Project ID and save location must be provided for export.");
  const { overwrite = false, zip = false, onProgress, signal } = options;
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

  if (zip) {
    return await zipExport(project, saveLocation, { overwrite, onProgress, signal });
  }

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
    const destDirByKind = { episode: episodesDir, clip: clipsDir } as const;
    const copySources = await planCopySources(project);
    const totalSteps = copySources.length + 2; // +2 for the save file and play files
    let doneSteps = 0;
    let exportedBytes = 0;

    for (const copySource of copySources) {
      throwIfCancelled();
      onProgress?.({
        message: `Copying file ${doneSteps + 1} of ${copySources.length}: ${copySource.fileName}`,
        fraction: doneSteps / totalSteps,
      });
      const dest = await path.join(destDirByKind[copySource.kind], copySource.fileName);
      await fs.copyFile(copySource.source, dest);
      exportedBytes += await fileSize(copySource.source);
      console.info(`Copied file from ${copySource.source} to ${dest}.`);
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
    console.info(`Finished exporting project ${projectID} to ${saveDir} (${exportedBytes} bytes of media).`);
    return { saveDir, exportedBytes };
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

type ZipProgress = {
  doneFiles: number;
  totalFiles: number;
  currentFile: string;
  writtenBytes: number;
};

/**
 * Streams the bundle straight from the source files into a single
 * `<date>.zip` via the Rust `zip_export` command - no staging folder.
 */
async function zipExport(
  project: Project,
  saveLocation: string,
  { overwrite, onProgress, signal }: Pick<ExportOptions, "overwrite" | "onProgress" | "signal">,
): Promise<{ saveDir: string; exportedBytes: number; }> {
  const zipPath = await path.join(saveLocation, `${project.date}.zip`);
  if (await fs.exists(zipPath)) {
    if (!overwrite) throw new ExportOverwriteRequiredError(zipPath);
    onProgress?.({ message: "Removing existing export archive...", fraction: null });
    await fs.remove(zipPath);
    console.info(`Removed existing export archive at ${zipPath}.`);
  }

  onProgress?.({ message: "Preparing archive...", fraction: 0 });
  const archiveDirByKind = { episode: ExportNames.EpisodeDir, clip: ExportNames.ClipsDir } as const;
  const copySources = await planCopySources(project);
  let totalBytes = 0;
  for (const copySource of copySources) {
    totalBytes += await fileSize(copySource.source);
  }

  const playFiles = makePlayFiles(project);
  const entries = [
    ...copySources.map(copySource => ({
      archivePath: `${archiveDirByKind[copySource.kind]}/${copySource.fileName}`,
      sourcePath: copySource.source,
    })),
    { archivePath: `${ExportNames.SaveDir}/${ExportNames.SaveFile}`, contents: await makePortableProjectJSON(project) },
    { archivePath: ExportNames.PlayFileSh, contents: playFiles.sh },
    { archivePath: ExportNames.PlayFilePs1, contents: playFiles.ps1 },
  ];

  const progressChannel = new Channel<ZipProgress>();
  progressChannel.onmessage = (progress) => {
    onProgress?.({
      message: `Zipping file ${Math.min(progress.doneFiles + 1, progress.totalFiles)} of ${progress.totalFiles}: ${progress.currentFile}`,
      fraction: totalBytes > 0 ? Math.min(progress.writtenBytes / totalBytes, 1) : null,
    });
  };

  // The Rust side polls a cancel flag between chunks and removes the partial archive itself
  const requestCancel = () => {
    invoke("zip_export_cancel")
      .catch((err: unknown) => {
        console.error("Failed to cancel zip export:", err);
      });
  };
  signal?.addEventListener("abort", requestCancel);

  try {
    if (signal?.aborted) throw new ExportCancelledError();
    const exportedBytes = await invoke<number>("zip_export", {
      outputPath: zipPath,
      entries,
      onProgress: progressChannel,
    });

    onProgress?.({ message: "Export complete.", fraction: 1 });
    console.info(`Finished exporting project ${project.id} to ${zipPath} (${exportedBytes} bytes).`);
    return { saveDir: zipPath, exportedBytes };
  }
  catch (err) {
    if (signal?.aborted) throw new ExportCancelledError();
    throw err instanceof Error ? err : new Error(String(err));
  }
  finally {
    signal?.removeEventListener("abort", requestCancel);
  }
}

type CopySource = { source: string; fileName: string; kind: "episode" | "clip"; };

/** Every media file that goes into the bundle, deduped; shared by export and size estimation */
async function planCopySources(project: Project): Promise<CopySource[]> {
  // Keyed by file name: the same file used twice is only copied once,
  // and validation guarantees distinct files never share a name
  const episodeSources = new Map<string, CopySource>();
  for (const episode of project.episodes) {
    if (!episode.filePath) continue;

    const fileName = await path.basename(episode.filePath);
    if (episodeSources.has(fileName)) continue;

    episodeSources.set(fileName, { source: episode.filePath, fileName, kind: "episode" });
  }

  const usedIDs = [...new Set<string>(project.blocks.flatMap(b => Object.entries(b.options).filter(([_, enabled]) => enabled).map(([id]) => id.split("__")[1])).filter((id): id is string => typeof id === "string"))];
  const usedClips = deepCopy(blockClips.filter(c => usedIDs.includes(c.id)));

  const clipFileNames = (await fs.readDir(PathName.ClipsDir))
    .map(f => f.isFile ? f.name : null)
    .filter(n => !!n && (
      n.endsWith(basicPauseClipFileName)
      || usedClips.some(c => c.file.endsWith(n))
    ))
    .filter((n): n is string => typeof n === "string");

  const clipSources: CopySource[] = [];
  for (const fileName of clipFileNames) {
    clipSources.push({ source: await path.join(PathName.ClipsDir, fileName), fileName, kind: "clip" });
  }

  return [...episodeSources.values(), ...clipSources];
}

async function fileSize(filePath: string): Promise<number> {
  try {
    return (await fs.stat(filePath)).size;
  }
  catch (e: unknown) {
    console.warn(`Could not read size of ${filePath}:`, e);
    return 0;
  }
}

/**
 * Sum of the source files that would go into the bundle. "Estimated" because
 * the written bundle may end up differing, e.g. once outputs can be zipped.
 */
export async function estimateExportSize(project: Project): Promise<number> {
  const sources = await planCopySources(project);
  let totalBytes = 0;
  for (const copySource of sources) {
    totalBytes += await fileSize(copySource.source);
  }
  return totalBytes;
}

async function makeDirRecursive(baseDir: string, dir: string): Promise<string> {
  const newDir = await path.join(baseDir, dir);
  await fs.mkdir(newDir, { recursive: true });
  return newDir;
}

async function copyProjectFile(project: Project, exportDir: string): Promise<void> {
  const projectDataPath = await path.join(exportDir, ExportNames.SaveFile);
  await fs.writeTextFile(projectDataPath, await makePortableProjectJSON(project));
  console.info(`Saved project data to ${projectDataPath}.`);
}

/**
 * Episode paths are rewritten relative to the bundle root so the save file is
 * self-contained: importing it on another computer recomputes absolute paths
 * from wherever the bundle sits. Probe caches are dropped so the importing
 * machine probes the copied files fresh instead of trusting stale metadata.
 */
async function makePortableProjectJSON(project: Project): Promise<string> {
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
  return JSON.stringify(portableProject);
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

import { reconcileBlockOptions } from "@/functions/block-options";
import { generateID } from "@/functions/sha256";
import { FileName, OPTION_REVISION, PathName } from "@/global";
import { isProject, isStandardObject } from "@/types";
import type { Block, Episode, ProjectData, ProjectMeta } from "@/types";
import { path } from "@tauri-apps/api";
import * as fs from "@tauri-apps/plugin-fs";

/**
 * Importing project save files: both v4 files (a project-data.json from an
 * export bundle) and save files from the v3 Electron app, which stored
 * everything at $HOME/stockholm-trekkers-playlist-maker/user-data/save-files/.
 */

// Shape of a v3 save file, see old-save-file.json in the repo root
type V3Option = { id: string; category?: string; checked?: boolean; };
type V3Episode = { filePath?: string; };
type V3Block = { startTime?: string; options?: V3Option[]; episodes?: V3Episode[]; };
type V3Save = { date?: string; dateModified?: number; blocks: V3Block[]; };

const V3AppFolderName = "stockholm-trekkers-playlist-maker";
/** Lives in the v3 save folder and lists the file names already migrated */
const MigrationMarkerFileName = ".stplay-v4-migrated.json";

function parseV3Save(value: unknown): V3Save | null {
  if (!isStandardObject(value)) return null;
  // v3 blocks nest their episodes; v4 keeps episodes at the top level
  if ("episodes" in value) return null;

  const blocks = value["blocks"];
  if (!Array.isArray(blocks)) return null;

  const v3Blocks: V3Block[] = [];
  for (const block of blocks as unknown[]) {
    if (!isStandardObject(block)) return null;
    if (!Array.isArray(block["episodes"])) return null;

    const episodes: V3Episode[] = [];
    for (const episode of block["episodes"] as unknown[]) {
      if (!isStandardObject(episode)) return null;
      episodes.push({ filePath: typeof episode["filePath"] === "string" ? episode["filePath"] : undefined });
    }

    const options: V3Option[] = [];
    if (Array.isArray(block["options"])) {
      for (const option of block["options"] as unknown[]) {
        if (!isStandardObject(option) || typeof option["id"] !== "string") continue;
        options.push({
          id: option["id"],
          category: typeof option["category"] === "string" ? option["category"] : undefined,
          checked: typeof option["checked"] === "boolean" ? option["checked"] : undefined,
        });
      }
    }

    v3Blocks.push({
      startTime: typeof block["startTime"] === "string" ? block["startTime"] : undefined,
      options,
      episodes,
    });
  }

  return {
    date: typeof value["date"] === "string" ? value["date"] : undefined,
    dateModified: typeof value["dateModified"] === "number" ? value["dateModified"] : undefined,
    blocks: v3Blocks,
  };
}

/** Maps v3 option entries like { id: "leading-sign-in-reminder" } to v4 keys like "leading__sign_in_reminder" */
function convertV3Options(options: V3Option[] | undefined): Block["options"] {
  const saved: Block["options"] = {};

  for (const option of options ?? []) {
    if (typeof option.checked !== "boolean") continue;
    const category = option.category ?? option.id.split("-")[0] ?? "";
    const clipID = option.id.startsWith(`${category}-`) ? option.id.slice(category.length + 1) : option.id;
    saved[`${category}__${clipID.replaceAll("-", "_")}`] = option.checked;
  }

  return reconcileBlockOptions(saved);
}

function convertV3Save(v3: V3Save): { meta: ProjectMeta; data: ProjectData; } {
  const projectID = generateID();
  const blocks: Block[] = [];
  const episodes: Episode[] = [];

  for (const v3Block of v3.blocks) {
    const blockID = generateID();
    const startTime = v3Block.startTime && v3Block.startTime !== "--:--" ? v3Block.startTime : undefined;
    blocks.push({
      id: blockID,
      options: convertV3Options(v3Block.options),
      ...(startTime ? { startTime } : {}),
    });

    for (const v3Episode of v3Block.episodes ?? []) {
      if (!v3Episode.filePath) continue;
      episodes.push({ id: generateID(), blockID, filePath: v3Episode.filePath });
    }
  }

  const now = Date.now();
  const meta: ProjectMeta = {
    id: projectID,
    date: v3.date ?? "",
    description: "",
    dateCreated: v3.dateModified ?? now,
    dateModified: v3.dateModified ?? now,
    optionsRev: OPTION_REVISION,
    blockCount: blocks.length,
    episodeCount: episodes.length,
  };

  return { meta, data: { id: projectID, blocks, episodes } };
}

async function writeProjectFiles(meta: ProjectMeta, data: ProjectData): Promise<void> {
  const projectDir = await path.join(PathName.UserProjectsDir, meta.id);
  if (await fs.exists(projectDir)) {
    throw new Error(`Project directory already exists: ${projectDir}, please resolve manually.`);
  }
  await fs.mkdir(projectDir, { recursive: true });
  await fs.writeTextFile(await path.join(projectDir, FileName.ProjectMeta), JSON.stringify(meta, null, 2));
  await fs.writeTextFile(await path.join(projectDir, FileName.ProjectData), JSON.stringify(data, null, 2));
}

/** Imports a parsed save file of either format as a NEW project (fresh ID) */
async function importParsedProject(value: unknown): Promise<ProjectMeta> {
  // v4 format: a full project dump, e.g. project-data.json from an export bundle
  if (isProject(value)) {
    const projectID = generateID();
    const meta: ProjectMeta = {
      id: projectID,
      date: value.date,
      description: value.description,
      dateCreated: value.dateCreated,
      dateModified: Date.now(),
      optionsRev: OPTION_REVISION,
      blockCount: value.blockCount,
      episodeCount: value.episodeCount,
    };
    const data: ProjectData = {
      id: projectID,
      blocks: value.blocks.map(block => ({ ...block, options: reconcileBlockOptions(block.options) })),
      episodes: value.episodes,
    };
    await writeProjectFiles(meta, data);
    return meta;
  }

  // v3 format from the Electron app
  const v3Save = parseV3Save(value);
  if (v3Save) {
    const { meta, data } = convertV3Save(v3Save);
    await writeProjectFiles(meta, data);
    return meta;
  }

  throw new Error("Unrecognized save file format.");
}

export async function importProjectFromFile(filePath: string): Promise<ProjectMeta> {
  const content = await fs.readTextFile(filePath);

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  }
  catch (e: unknown) {
    throw new Error(`Not a valid JSON file: ${filePath}`, { cause: e });
  }

  return await importParsedProject(parsed);
}

/**
 * Copies every not-yet-migrated save file from the v3 install location into
 * v4 projects. Non-destructive: v3 files stay where they are; a marker file
 * in the v3 folder records which files are done, so failures retry next
 * launch without duplicating the successes.
 * Returns the number of projects migrated this run.
 */
export async function migrateV3SaveFiles(): Promise<number> {
  const homeDir = await path.homeDir();
  const v3SaveDir = await path.join(homeDir, V3AppFolderName, "user-data", "save-files");
  if (!await fs.exists(v3SaveDir)) return 0;

  const markerPath = await path.join(v3SaveDir, MigrationMarkerFileName);
  let migrated: string[] = [];
  if (await fs.exists(markerPath)) {
    try {
      const parsed: unknown = JSON.parse(await fs.readTextFile(markerPath));
      if (Array.isArray(parsed)) migrated = parsed.filter((n): n is string => typeof n === "string");
    }
    catch (e: unknown) {
      console.error("Failed to read v3 migration marker, treating all files as unmigrated:", e);
    }
  }

  const fileNames = (await fs.readDir(v3SaveDir))
    .filter(entry => entry.isFile && entry.name.endsWith(".json") && entry.name !== MigrationMarkerFileName)
    .map(entry => entry.name)
    .filter(name => !migrated.includes(name));

  let migratedCount = 0;
  for (const fileName of fileNames) {
    const filePath = await path.join(v3SaveDir, fileName);
    try {
      await importProjectFromFile(filePath);
      migrated.push(fileName);
      migratedCount++;
      console.info(`Migrated v3 save file ${fileName}.`);
    }
    catch (e: unknown) {
      console.error(`Failed to migrate v3 save file ${fileName}:`, e);
    }
  }

  if (migratedCount > 0) {
    await fs.writeTextFile(markerPath, JSON.stringify(migrated, null, 2));
  }

  return migratedCount;
}

// The migration only needs to run once per app launch
let migrationPromise: Promise<number> | null = null;
export function migrateV3SaveFilesOnce(): Promise<number> {
  migrationPromise ??= migrateV3SaveFiles();
  return migrationPromise;
}

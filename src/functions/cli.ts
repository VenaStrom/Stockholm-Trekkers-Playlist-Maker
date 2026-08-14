import { invoke } from "@tauri-apps/api/core";
import * as fs from "@tauri-apps/plugin-fs";
import { createProject, deleteProject, exportProject, getAllProjectMetas, openProject, saveProject } from "@/functions/project";
import { probeEpisode } from "@/functions/project/episode-probe";
import { compileTimeline } from "@/functions/compile-timeline";
import { allOptionEntries, getUserDefaultBlockOptions, reconcileBlockOptions } from "@/functions/block-options";
import { parseBlockTime } from "@/functions/project/time-parser";
import { parseDate } from "@/functions/project/date-parser";
import { validateBlockTime, validateDate } from "@/functions/project/validate-inputs";
import { generateID } from "@/functions/sha256";
import type { EncodingStrategy } from "@/functions/project/export-project";
import type { Block, Episode, EpisodeDefinedPath, Project } from "@/types";

/**
 * Headless CLI mode. The app is launched with a subcommand, runs it without
 * showing a window, prints a single machine-readable JSON line to stdout
 * (via the `cli_print` Rust command, bypassing the log formatting), and exits.
 *
 * Log lines also land on stdout but are prefixed (`[INFO]...` or ANSI color
 * codes), so consumers can pick out the result with something like `grep '^{'`.
 */

type Flags = Record<string, string>;

const FlagAliases: Record<string, string> = {
  "p": "project",
  "id": "project",
  "project-id": "project",
  "o": "out",
  "output": "out",
  "s": "spec",
  "file": "spec",
};

/** Flags that take no value, so they never consume the following token */
const BooleanFlags = new Set(["zip"]);

function parseFlags(tokens: string[]): Flags {
  const flags: Flags = {};

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i] ?? "";
    if (!token.startsWith("-")) continue;

    let key = token.replace(/^--?/, "");
    let value = "";

    const equalsIndex = key.indexOf("=");
    if (equalsIndex !== -1) {
      value = key.slice(equalsIndex + 1);
      key = key.slice(0, equalsIndex);
    }
    key = FlagAliases[key] ?? key;

    if (equalsIndex === -1) {
      if (BooleanFlags.has(key)) {
        value = "true";
      }
      else {
        const next = tokens[i + 1] ?? "";
        if (next && !next.startsWith("-")) {
          value = next;
          i++;
        }
      }
    }

    flags[key] = value;
  }

  return flags;
}

/** Raw stdout, bypassing the log plugin's formatting */
async function cliPrint(message: string): Promise<void> {
  try {
    await invoke("cli_print", { message });
  }
  catch {
    console.log(message);
  }
}

async function exitWith(code: number): Promise<void> {
  await invoke("close", { code }).catch((e: unknown) => {
    console.error("Failed to close app after CLI run.", e);
  });
}

/** Everything a spec can say about a playlist; all fields optional so specs stay terse */
type SpecBlock = {
  startTime?: string;
  /** Keys like "leading__countdown"; merged over the user's default options */
  options?: Record<string, boolean>;
  /** Episode video files in play order, as plain paths or { file } objects */
  episodes?: (string | { file: string })[];
};
type PlaylistSpec = {
  date?: string;
  description?: string;
  blocks?: SpecBlock[];
};

function isPlaylistSpec(value: unknown): value is PlaylistSpec {
  if (typeof value !== "object" || value === null) return false;
  const spec = value as Record<string, unknown>;

  if ("date" in spec && typeof spec["date"] !== "string") return false;
  if ("description" in spec && typeof spec["description"] !== "string") return false;

  if ("blocks" in spec) {
    if (!Array.isArray(spec["blocks"])) return false;
    for (const block of spec["blocks"] as unknown[]) {
      if (typeof block !== "object" || block === null) return false;
      const b = block as Record<string, unknown>;
      if ("startTime" in b && typeof b["startTime"] !== "string") return false;
      if ("options" in b && (typeof b["options"] !== "object" || b["options"] === null)) return false;
      if ("episodes" in b) {
        if (!Array.isArray(b["episodes"])) return false;
        for (const episode of b["episodes"] as unknown[]) {
          const isPath = typeof episode === "string";
          const isFileObject = typeof episode === "object" && episode !== null
            && typeof (episode as Record<string, unknown>)["file"] === "string";
          if (!isPath && !isFileObject) return false;
        }
      }
    }
  }

  return true;
}

async function readSpecFile(specPath: string): Promise<PlaylistSpec> {
  if (!await fs.exists(specPath)) {
    throw new Error(`Spec file does not exist: ${specPath}`);
  }

  const raw = await fs.readTextFile(specPath);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  }
  catch (e: unknown) {
    throw new Error(`Spec file is not valid JSON: ${e instanceof Error ? e.message : String(e)}`, { cause: e });
  }

  if (!isPlaylistSpec(parsed)) {
    throw new Error("Spec file does not match the expected format. Run the `help` command for the format.");
  }

  return parsed;
}

/**
 * Applies a spec onto a project: replaces blocks and episodes when the spec
 * has a `blocks` array, probes every episode file, recomputes the timeline,
 * and saves. Returns non-blocking validation warnings.
 */
async function applySpec(project: Project, spec: PlaylistSpec): Promise<{ project: Project; warnings: string[]; }> {
  const warnings: string[] = [];

  if (spec.date !== undefined) {
    project.date = parseDate(spec.date);
  }
  if (spec.description !== undefined) {
    project.description = spec.description;
  }

  if (spec.blocks) {
    // Keep probe results for files already in the project so re-applies stay fast
    const probeCache = new Map<string, Episode>();
    for (const episode of project.episodes) {
      if (episode.filePath && episode.cachedDuration) {
        probeCache.set(episode.filePath, episode);
      }
    }

    const knownOptionKeys = new Set(allOptionEntries().map(entry => entry.key));
    const defaultOptions = getUserDefaultBlockOptions();

    const blocks: Block[] = [];
    const episodes: Episode[] = [];

    for (const [blockIndex, specBlock] of spec.blocks.entries()) {
      for (const key of Object.keys(specBlock.options ?? {})) {
        if (!knownOptionKeys.has(key)) {
          warnings.push(`Block ${blockIndex + 1}: unknown option "${key}" was ignored. Run the \`help\` command for valid keys.`);
        }
      }

      const block: Block = {
        id: generateID(),
        options: reconcileBlockOptions(specBlock.options, defaultOptions),
        startTime: specBlock.startTime ? parseBlockTime(specBlock.startTime) : undefined,
      };
      blocks.push(block);

      for (const specEpisode of specBlock.episodes ?? []) {
        const filePath = typeof specEpisode === "string" ? specEpisode : specEpisode.file;

        if (!await fs.exists(filePath)) {
          throw new Error(`Episode file does not exist: ${filePath}`);
        }

        const cached = probeCache.get(filePath);
        if (cached) {
          episodes.push({
            id: generateID(),
            blockID: block.id,
            filePath,
            cachedDuration: cached.cachedDuration,
            cachedSize: cached.cachedSize,
            cachedEncoding: cached.cachedEncoding,
          });
          continue;
        }

        const bareEpisode: EpisodeDefinedPath = { id: generateID(), blockID: block.id, filePath };
        const probed = await probeEpisode(bareEpisode);
        probeCache.set(filePath, probed);
        episodes.push(probed);
      }
    }

    project.blocks = blocks;
    project.episodes = episodes;
  }

  compileTimeline(project);

  const dateWarning = validateDate(project.date);
  if (dateWarning) warnings.push(`Date "${project.date}": ${dateWarning}`);
  for (const [blockIndex, block] of project.blocks.entries()) {
    const timeWarning = validateBlockTime(block, project);
    if (timeWarning) warnings.push(`Block ${blockIndex + 1} time "${block.startTime ?? ""}": ${timeWarning}`);
  }

  await saveProject(project);

  // Reopen so the output reflects what saveProject normalized (dedupe, sorting, trailing empties)
  const saved = await openProject(project.id);
  return { project: saved, warnings };
}

function requireFlag(flags: Flags, name: string, usage: string): string {
  const value = flags[name];
  if (!value) {
    throw new Error(`Missing --${name}. Usage: ${usage}`);
  }
  return value;
}

function isEncodingStrategy(value: string): value is EncodingStrategy {
  return value === "preserve" || value === "h264" || value === "hevc";
}

const HelpText = `Stockholm Trekkers Playlist Maker - headless CLI

The app runs windowless, prints one JSON result line to stdout, and exits
(code 0 on success, 1 on failure). Log lines share stdout but are prefixed;
extract the result with e.g.:  app <command> ... | grep '^{'

Commands:
  help                                   Print this help
  list                                   List all projects (meta only)
  show    --project <id>                 Print a full project as JSON
  create  [--spec <file.json>]           Create a project, optionally from a spec
  apply   --project <id> --spec <file>   Apply a spec to an existing project
  delete  --project <id>                 Delete a project
  export  --project <id> --out <dir>     Export a playlist bundle
          [--zip] [--encoding preserve|h264|hevc]

Flag aliases: --project/-p/--id/--project-id, --out/-o/--output, --spec/-s/--file

Spec file format (all fields optional; a "blocks" array REPLACES all existing
blocks and episodes in the project):
{
  "date": "2026-09-12",            // the event date, YYYY-MM-DD
  "description": "TNG night",
  "blocks": [
    {
      "startTime": "18:00",        // HH:MM
      "options": { ${allOptionEntries().map(entry => `"${entry.key}": ${String(entry.clip.default)}`).join(", ")} },
      "episodes": ["/absolute/path/episode1.mkv", "/absolute/path/episode2.mkv"]
    }
  ]
}
Episode files are probed with ffprobe on apply, so they must exist and be
video files. Unset options fall back to the user's defaults.`;

async function runCliCommand(command: string, flags: Flags): Promise<{ result: Record<string, unknown>; warnings?: string[]; }> {
  switch (command) {
    case "list": {
      const projects = await getAllProjectMetas();
      return { result: { projects } };
    }

    case "show": {
      const projectID = requireFlag(flags, "project", "app show --project <id>");
      const project = await openProject(projectID);
      return { result: { project } };
    }

    case "create": {
      const project = await createProject();
      if (!flags["spec"]) {
        return { result: { project } };
      }
      const spec = await readSpecFile(flags["spec"]);
      const applied = await applySpec(project, spec);
      return { result: { project: applied.project }, warnings: applied.warnings };
    }

    case "apply": {
      const usage = "app apply --project <id> --spec <file.json>";
      const projectID = requireFlag(flags, "project", usage);
      const specPath = requireFlag(flags, "spec", usage);
      const project = await openProject(projectID);
      const spec = await readSpecFile(specPath);
      const applied = await applySpec(project, spec);
      return { result: { project: applied.project }, warnings: applied.warnings };
    }

    case "delete": {
      const projectID = requireFlag(flags, "project", "app delete --project <id>");
      await deleteProject(projectID);
      return { result: { deleted: projectID } };
    }

    case "export": {
      const usage = "app export --project <id> --out <folder> [--zip] [--encoding preserve|h264|hevc]";
      const projectID = requireFlag(flags, "project", usage);
      const saveLocation = requireFlag(flags, "out", usage);

      const encoding = flags["encoding"];
      if (encoding !== undefined && !isEncodingStrategy(encoding)) {
        throw new Error(`Invalid --encoding "${encoding}". Usage: ${usage}`);
      }

      console.info(`CLI export start: projectID=${projectID}, out=${saveLocation}`);
      // Headless runs are non-interactive, so replace an existing export folder instead of failing
      await exportProject(projectID, saveLocation, {
        overwrite: true,
        zip: "zip" in flags,
        encoding,
        onProgress: (progress) => console.info(`CLI export: ${progress.message}`),
      });
      return { result: { exported: projectID, out: saveLocation } };
    }

    default:
      throw new Error(`Unknown command "${command}". Run the \`help\` command for usage.`);
  }
}

const CliCommands = new Set(["help", "list", "show", "create", "apply", "delete", "export"]);

/** Returns true when the app ran (and exited) in CLI mode, false to boot the GUI */
export async function maybeRunCliMode(): Promise<boolean> {
  let argv: string[];
  try {
    argv = await invoke<string[]>("get_cli_args");
  } catch {
    return false;
  }

  if (!Array.isArray(argv) || argv.length < 2) return false;

  const tokens = argv.slice(1);
  const command = tokens[0] ?? "";
  if (!CliCommands.has(command)) return false;

  if (command === "help") {
    await cliPrint(HelpText);
    await exitWith(0);
    return true;
  }

  const flags = parseFlags(tokens.slice(1));

  try {
    const { result, warnings } = await runCliCommand(command, flags);
    await cliPrint(JSON.stringify({ ok: true, command, ...result, warnings: warnings ?? [] }));
    await exitWith(0);
  }
  catch (e: unknown) {
    console.error(`CLI ${command} failed.`, e);
    const message = e instanceof Error ? e.message : String(e);
    await cliPrint(JSON.stringify({ ok: false, command, error: message }));
    await exitWith(1);
  }

  return true;
}

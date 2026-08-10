import { deepCopy } from "@/functions/deep-copy";
import { hhmmToSeconds, secondsToHHMMSS } from "@/functions/project/time-format";
import { blockClips, ExportNames } from "@/global";
import type { EpisodeDefinedPath, PlayFiles, Project } from "@/types";

const templateVariableRegex = /__[A-Z_]+__/g;
const author = __AUTHOR__ ?? { name: "__AUTHOR__.name", email: "__AUTHOR__.email", url: "__AUTHOR__.url" };

export function makePlayFiles(project: Project): PlayFiles {
  if (!__PLAY_PS1_TEMPLATE__ || !__PLAY_SH_TEMPLATE__) {
    throw new Error("Play file templates are not defined. Cannot generate play files.");
  }

  const f: PlayFiles = { ps1: __PLAY_PS1_TEMPLATE__.toString(), sh: __PLAY_SH_TEMPLATE__.toString() };

  const templateInfo: Record<string, string> = {
    __SIGN_OFF_NAME__: author.name.split(" ")[0] || author.name,
    __AUTHOR__: author.name,
    __APP_VERSION__: __VERSION__ || "__VERSION__",
    __REPO_URL__: __REPOSITORY_URL__ || "__REPOSITORY_URL__",
    __EMAIL__: author.email,
    __OPTIONS_REV__: project.optionsRev.toString(),
    __PLAYLIST_DATE__: project.date,
    __CREATED_DATE__: new Date(project.dateCreated).toISOString(),
    __EXPORTED_DATE__: new Date().toISOString(),
    __PLAYLIST_ID__: project.id,
    __BLOCK_COUNT__: project.blockCount.toString(),
    __EPISODE_COUNT__: project.episodeCount.toString(),
    __DESCRIPTION_CODE__: project.description.trim().split("\n").map(line => `print "$GRAY" "${line}\\n"`).join("\n"),
    __PARSED_PLAYLIST_CODE__: projectToString(project).split("\n").map(line => `print "$GRAY" "${line}\\n"`).join("\n"),
    __BLOCKS_CODE__: makeBlocks(project),
  };

  // Replace variables in the template
  for (const [varName, value] of Object.entries(templateInfo)) {
    if (!value) continue; // Skip falsy
    const regex = new RegExp(varName, "g");
    f.sh = f.sh.replace(regex, value);
    f.ps1 = f.ps1.replace(regex, value);
  }

  // Warn if any template variables are not replaced
  if (f.sh.match(templateVariableRegex)) {
    const unreplaced = Array.from(f.sh.matchAll(templateVariableRegex)).map(m => m[0]);
    console.warn("Warning: The following template variables were not replaced in the generated play.sh:\n", unreplaced);
  }
  if (f.ps1.match(templateVariableRegex)) {
    const unreplaced = Array.from(f.ps1.matchAll(templateVariableRegex)).map(m => m[0]);
    console.warn("Warning: The following template variables were not replaced in the generated play.ps1:\n", unreplaced);
  }

  return f;
}

function makeBlocks(project: Project): string {
  return project.blocks.map((block, index) => {
    if (!block.startTime || block.startTime === "--:--") {
      console.warn(`Warning: Block ${index + 1} is missing a valid start time. This block will be skipped in the generated play files.`);
      return null;
    }
    const startInSeconds = hhmmToSeconds(block.startTime);
    if (startInSeconds === null) {
      console.warn(`Warning: Block ${index + 1} has an invalid start time format ("${block.startTime}"). Expected "HH:MM" or "HH:MM:SS". This block will be skipped in the generated play files.`);
      return null;
    }

    const leadingIDs: string[] = [];
    const trailingIDs: string[] = [];
    for (const [compoundOptionID, enabled] of Object.entries(block.options)) {
      if (!enabled) continue;
      const [position, clipID] = compoundOptionID.split("__");
      if (!clipID || !position) {
        console.warn(`Warning: Invalid block option ID "${compoundOptionID}" in block ${block.id}. Expected format "position_clipID". Skipping this option.`);
        continue;
      }
      if (position === "leading") leadingIDs.push(clipID);
      else if (position === "trailing") trailingIDs.push(clipID);
      else {
        console.warn(`Warning: Invalid position "${position}" in block option ID "${compoundOptionID}" in block ${block.id}. Expected "leading" or "trailing". Skipping this option.`);
        continue;
      }
    }
    const leadingClips = deepCopy(blockClips.filter(c => leadingIDs.includes(c.id)));
    const trailingClips = deepCopy(blockClips.filter(c => trailingIDs.includes(c.id)));

    const leadingSumSeconds = leadingClips.reduce((sum, clip) => sum + clip.duration, 0);

    const episodes = project.episodes.filter((e): e is EpisodeDefinedPath => e.blockID === block.id && !!e.filePath);
    const episodeNames = episodes.map(e => e.filePath.split(/[\\/]/).pop()).filter(Boolean) as string[];

    return blockString({
      blockNumber: (index + 1).toString(),
      blockID: block.id,
      blockOptions: Object.entries(block.options).map(([optionID, enabled]) => `${optionID}:${enabled}`).join(", "),
      blockStartTime: block.startTime || "--:--",
      // Seconds precision matters here: leading clips are 119 s, not 120
      adjustedBlockStartTime: secondsToHHMMSS(startInSeconds - leadingSumSeconds),
      playCode: playSeries([
        ...leadingClips.map(c => `${ExportNames.ClipsDir}/${c.file}`),
        ...episodeNames.map(e => `${ExportNames.EpisodeDir}/${e}`),
        ...trailingClips.map(c => `${ExportNames.ClipsDir}/${c.file}`),
      ]),
    });
  })
    .filter((b): b is string => b !== null)
    .join("\n\n");
}
function blockString(details: {
  blockNumber: string;
  adjustedBlockStartTime: string;
  blockStartTime: string;
  blockID: string;
  blockOptions: string;
  playCode: string;
}): string {
  return `
# Block ${details.blockNumber}
# Start time is adjusted for leading clips so the first episode lands exactly on the block start time
wait_until "${details.adjustedBlockStartTime}" "Block ${details.blockNumber}"
print "$BOLD" "$BLUE" "======== Block ${details.blockNumber} - episodes start at ${details.blockStartTime} ========\\n"
print "$GRAY" "id=${details.blockID} options: ${details.blockOptions}\\n"
${details.playCode}
print "$GRAY" "Block ${details.blockNumber} queued in full. Pause filler follows until the next block.\\n"
long_pause
print "\\n"
  `.trim();
}
function play(filePath: string): string {
  return `play "${filePath}"\n`;
}
function enqueue(filePath: string): string {
  return `enqueue "${filePath}"\n`;
}
function playSeries(paths: string[], enqueueAll: boolean = false): string {
  return paths.map((p, i) => (enqueueAll || i > 0)
    ? enqueue(p)
    : play(p),
  ).join("");
}
function projectToString(project: Project): string {
  return `
Project ${project.date}
${project.blocks.map((block, index) => {
    const episodes = project.episodes.filter(e => e.blockID === block.id && e.filePath);
    return `
Block ${index + 1} - ${block.startTime || "No start time"}
${episodes.map(e => `  ${(e.cachedStartTime || "--:--").padEnd(8, " ")} ${e.filePath?.split(/[\\/]/).pop()}`).join("\n")}
      `.trim();
  }).join("\n")}
  `.trim();
}
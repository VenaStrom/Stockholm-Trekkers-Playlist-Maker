import { hhmmToSeconds, secondsToHHMM } from "@/functions/project/time-format";
import { blockClips, ExportNames } from "@/global";
import type { EpisodeDefinedPath, PlayFiles, Project } from "@/types";
import { writeFileSync, readFileSync } from "node:fs";

const shTemplate = readFileSync("src/functions/project/export/play.sh", "utf-8");
const ps1Template = readFileSync("src/functions/project/export/play.ps1", "utf-8");

const templateVariableRegex = /__[A-Z_]+__/g;

export function makePlayFiles(project: Project): PlayFiles {
  const f: PlayFiles = { ps1: ps1Template.toString(), sh: shTemplate.toString() };

  const templateInfo = {
    __SIGN_OFF_NAME__: __AUTHOR__.name.split(" ")[0] || __AUTHOR__.name,
    __AUTHOR__: __AUTHOR__.name,
    __APP_VERSION__: __VERSION__,
    __REPO_URL__: __REPOSITORY_URL__,
    __EMAIL__: __AUTHOR__.email,
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
      adjustedBlockStartTime: secondsToHHMM(startInSeconds - leadingSumSeconds),
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
# Block header
wait_until "${details.adjustedBlockStartTime}" # Adjusted for leading clips to align episode start time to block start time
print "$BOLD" "Block ${details.blockNumber} - ${details.blockStartTime}\\n"
print "$GRAY" "id=${details.blockID} options: ${details.blockOptions}\\n"
${details.playCode}
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

function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj) as unknown as string) as T;
}

const __AUTHOR__ = { name: "Vena", email: "strom.vena+stplay@gmail.com" };
const __VERSION__ = "4.0.0";
const __REPOSITORY_URL__ = "https://github.com/VenaStrom/Stockholm-Trekkers-Playlist-Maker";

const project = { "id": "2b1cfa9bccf0730d", "date": "2026-05-02", "description": "Program för trekdagen 2 maj 2026:\nTEMA:   Vänner och fiender (eller var det kanske tvärt om…)\n\n10:10   The Enemy             TNG 3:7\n10:55   PAUS\n11:25   Blood of Patriots     ORV 2:10\n12:15   Nemesis               VOY 4:4\n13:00   LUNCH\n14:30   Preemptive Strike     TNG 7:24\n15:15   PAUS med uppstart av spel \n15:30   The Shipment          ENT 3:7\n16:15   PAUS\n16:45   For the Cause         DS9 4:21\n17:30   Investigations        VOY 2:20\n18:15   PAUS\n18:30   Hippocratic Oath      DS9 4:3\n19:15   Common Ground         SGA 3:7\n20:00   SLUT\n", "dateCreated": 1777200844576, "optionsRev": 0, "blockCount": 3, "episodeCount": 3, "blocks": [{ "id": "734db63fad9a2c02", "options": { "leading__countdown": true, "leading__emergency_routine": true, "trailing__emergency_routine": true, "trailing__sign_in_reminder": false, "leading__covid_disclaimer": false }, "startTime": "10:10" }, { "id": "8d21cb44a1fa463d", "options": { "leading__countdown": true, "leading__emergency_routine": true, "trailing__emergency_routine": true, "trailing__sign_in_reminder": false, "leading__covid_disclaimer": false }, "startTime": "11:25" }, { "id": "7e156d660878effe", "options": { "leading__countdown": true, "leading__emergency_routine": true, "trailing__emergency_routine": true, "trailing__sign_in_reminder": false, "leading__covid_disclaimer": false }, "startTime": "" }], "episodes": [{ "id": "80c1c5efe741630d", "blockID": "734db63fad9a2c02", "filePath": "/home/vena/Videos/2025-10-04/episodes/Star Trek - Lower Decks S03E06 - Hear All Trust Nothing.mkv", "cachedDuration": 1585.251, "cachedSize": 490887983, "cachedEncoding": "h264", "cachedStartTime": "10:10", "cachedEndTime": "10:36" }, { "id": "c39e321c6d6f882b", "blockID": "734db63fad9a2c02" }, { "id": "3e2095707fe800e7", "blockID": "8d21cb44a1fa463d", "filePath": "/home/vena/Videos/2025-10-04/episodes/Star Trek TNG S01E26 - The Neutral Zone.mkv", "cachedDuration": 2733.648, "cachedSize": 2496581781, "cachedEncoding": "h264", "cachedStartTime": "11:25", "cachedEndTime": "12:10" }, { "id": "12fc923724db9e47", "blockID": "8d21cb44a1fa463d", "filePath": "/home/vena/Videos/2025-10-04/episodes/SPOCK-Never-Trust-a-Klingon.mp4", "cachedDuration": 260, "cachedSize": 24597944, "cachedEncoding": "hevc", "cachedStartTime": "12:10", "cachedEndTime": "12:14" }, { "id": "6b369b9805ead585", "blockID": "8d21cb44a1fa463d" }, { "id": "eb09aeedc72b6299", "blockID": "7e156d660878effe" }, { "id": "ba8210feb49fc851", "blockID": "7e156d660878effe" }] };

const res = makePlayFiles(project);

writeFileSync("ignore/play.ps1", res.ps1);
writeFileSync("ignore/play.sh", res.sh);
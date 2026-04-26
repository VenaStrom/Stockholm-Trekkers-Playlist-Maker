import type { Project } from "@/types";
import { writeFileSync, readFileSync } from "node:fs";

const shTemplate = readFileSync("src/functions/project/export/play.sh", "utf-8");

// Extraction
const templateVariableRegex = /__[A-Z_]+__/g;
const extractedVariables: Record<string, string> = {};
for (const match of shTemplate.matchAll(templateVariableRegex)) {
  const varName = match[0];
  extractedVariables[varName] = "";
}
console.info("Extracted these variables from play.sh");

type PlayFiles = { ps1: string; sh: string };

export function makePlayFiles(project: Project): PlayFiles {
  const f: PlayFiles = { ps1: "", sh: shTemplate.toString() };

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
    __DESCRIPTION_CODE__: "",
    __PARSED_PLAYLIST_CODE__: "",
    __BLOCKS_CODE__: "",


    __DELETE__: "",


    __BLOCK_TEMPLATE_START__: "",

    __BLOCK_NUMBER__: "",
    __ADJUSTED_BLOCK_START_TIME__: "",
    __BLOCK_START_TIME__: "",
    __BLOCK_ID__: "",
    __BLOCK_OPTIONS__: "",
    __LEADING_CLIPS_CODE__: "",
    __EPISODES_CODE__: "",
    __TRAILING_CLIPS_CODE__: "",

    __BLOCK_TEMPLATE_END__: "",
  };

  // Mismatch warning for missing variables 
  const extraLocalVars = Object.keys(templateInfo).filter(k => !(k in extractedVariables));
  const missingLocalVars = Object.keys(extractedVariables).filter(k => !(k in templateInfo));
  if (extraLocalVars.length > 0) {
    console.warn("Warning: These local variables are defined in templateInfo but not found in the template:\n", extraLocalVars);
  }
  if (missingLocalVars.length > 0) {
    console.warn("Warning: These variables are used in the template but not defined in templateInfo:\n", missingLocalVars);
  }

  // Description
  templateInfo.__DESCRIPTION_CODE__ = project.description.split("\n").map(line => `print "$GRAY" "${line}\\n"`).join("\n");



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

const __AUTHOR__ = { name: "Vena", email: "strom.vena+stplay@gmail.com" };
const __VERSION__ = "4.0.0";
const __REPOSITORY_URL__ = "https://github.com/VenaStrom/Stockholm-Trekkers-Playlist-Maker";

const project = { "id": "ba1d8d9892da28ef", "date": "2026-05-02", "description": "Program för trekdagen 2 maj 2026:\nTEMA:   Vänner och fiender (eller var det kanske tvärt om…)\n\n10:10   The Enemy             TNG 3:7\n10:55   PAUS\n11:25   Blood of Patriots     ORV 2:10\n12:15   Nemesis               VOY 4:4\n13:00   LUNCH\n14:30   Preemptive Strike     TNG 7:24\n15:15   PAUS med uppstart av spel \n15:30   The Shipment          ENT 3:7\n16:15   PAUS\n16:45   For the Cause         DS9 4:21\n17:30   Investigations        VOY 2:20\n18:15   PAUS\n18:30   Hippocratic Oath      DS9 4:3\n19:15   Common Ground         SGA 3:7\n20:00   SLUT\n\n", "dateCreated": 1776594158733, "optionsRev": 0, "blockCount": 4, "episodeCount": 9, "blocks": [{ "id": "3af7e166474ce708", "options": { "leading_Countdown": true, "leading_EmergencyRoutine": true, "trailing_EmergencyRoutine": true, "trailing_SignInReminder": false, "leading_CovidDisclaimer": false }, "startTime": "10:10" }, { "id": "59681d02cc3024f8", "options": { "leading_Countdown": true, "leading_EmergencyRoutine": true, "trailing_EmergencyRoutine": true, "trailing_SignInReminder": false, "leading_CovidDisclaimer": false }, "startTime": "05:60" }, { "id": "68d1df012066e048", "options": { "leading_Countdown": true, "leading_EmergencyRoutine": true, "trailing_EmergencyRoutine": true, "trailing_SignInReminder": false, "leading_CovidDisclaimer": false }, "startTime": "14:00" }, { "id": "482209239f696750", "options": { "leading_Countdown": true, "leading_EmergencyRoutine": true, "trailing_EmergencyRoutine": true, "trailing_SignInReminder": false, "leading_CovidDisclaimer": false } }], "episodes": [{ "id": "c427b325a9b52f2f", "blockID": "3af7e166474ce708", "filePath": "/home/vena/Videos/2025-10-04/episodes/Star Trek VOY S05E08 - Nothing Human.mkv", "duration": 2648.4, "cachedStartTime": "10:10", "cachedEndTime": "10:54", "cachedDuration": 2648.4, "cachedSize": 451550574, "cachedEncoding": "h264" }, { "id": "55914712a11a4673", "blockID": "3af7e166474ce708", "filePath": "/home/vena/Videos/2025-10-04/episodes/SPOCK-Never-Trust-a-Klingon.mp4", "cachedStartTime": "10:54", "cachedEndTime": "10:58", "cachedDuration": 260, "cachedSize": 24597944, "cachedEncoding": "hevc" }, { "id": "a5003951adcb7fb0", "blockID": "3af7e166474ce708", "filePath": "/home/vena/Videos/2025-10-04/pauses/pause_1_min_emergency.mp4", "cachedStartTime": "10:58", "cachedEndTime": "10:59", "cachedDuration": 59.98, "cachedSize": 17730531, "cachedEncoding": "hevc" }, { "id": "c34ee4d82337fc44", "blockID": "3af7e166474ce708", "filePath": "/home/vena/Videos/2025-10-04/episodes/Star Trek TNG S01E26 - The Neutral Zone.mkv", "cachedStartTime": "10:59", "cachedEndTime": "11:45", "cachedDuration": 2733.648, "cachedSize": 2496581781, "cachedEncoding": "h264" }, { "id": "158a1e0d8dc986e2", "blockID": "3af7e166474ce708" }, { "id": "471c5961407111b2", "blockID": "59681d02cc3024f8", "filePath": "/home/vena/Videos/2025-10-04/episodes/Star Trek TNG S01E26 - The Neutral Zone.mkv", "duration": 2733.648, "cachedStartTime": "06:00", "cachedEndTime": "06:45", "cachedDuration": 2733.648, "cachedSize": 2496581781, "cachedEncoding": "h264" }, { "id": "361b4e46bc1c1dd8", "blockID": "59681d02cc3024f8", "filePath": "/home/vena/Videos/2025-10-04/episodes/SPOCK-Never-Trust-a-Klingon.mp4", "duration": 260, "cachedStartTime": "06:45", "cachedEndTime": "06:49", "cachedDuration": 260, "cachedSize": 24597944, "cachedEncoding": "hevc" }, { "id": "93bd5cc17b319291", "blockID": "59681d02cc3024f8" }, { "id": "b93feff106e124b5", "blockID": "68d1df012066e048", "filePath": "/home/vena/Videos/2025-10-04/episodes/SPOCK-Never-Trust-a-Klingon.mp4", "cachedStartTime": "14:00", "cachedEndTime": "14:04", "cachedDuration": 260, "cachedSize": 24597944, "cachedEncoding": "hevc" }, { "id": "c7e48ad268fbb2bd", "blockID": "68d1df012066e048" }, { "id": "260baca4fd0b63a4", "blockID": "482209239f696750", "filePath": "/home/vena/Videos/2025-10-04/episodes/Star Trek TNG S01E26 - The Neutral Zone.mkv", "cachedDuration": 2733.648, "cachedSize": 2496581781, "cachedEncoding": "h264" }, { "id": "fdbd78da63786b77", "blockID": "482209239f696750", "filePath": "/home/vena/Videos/2025-10-04/episodes/Star Trek TOS S03E01 - Spocks Brain.mkv", "cachedDuration": 3048.096, "cachedSize": 1732564541, "cachedEncoding": "h264" }, { "id": "b541e97d0e5b2ccf", "blockID": "482209239f696750" }] };
const res = makePlayFiles(project);

writeFileSync("ignore/play.ps1", res.ps1);
writeFileSync("ignore/play.sh", res.sh);

import { path } from "@tauri-apps/api";
import type { BlockClip } from "@/types";

export const OPTION_REVISION = 0;

/** 
 * Used for things like quick-deletes
 */
export const PowerKey = "Shift";

/** 
 * Add another entry here to define the clip, and then reference it in BlockOptions below for it to appear in the UI
 */
export const blockClips: BlockClip[] = [
  {
    id: "countdown",
    name: "Countdown",
    default: true,
    duration: 60,
    file: "1_min_countdown.mp4",
    description: "Adds a 1 minute countdown before playing the first episode of the block",
    allowedPlacement: { leading: true },
  },
  {
    id: "emergency_routine",
    name: "Emergency Routine",
    default: true,
    duration: 59,
    file: "1_min_emergency.mp4",
    description: "Adds a 1 minute clip, describing our emergency routines, before playing the first episode of the block",
    allowedPlacement: { leading: true, trailing: true },
  },
  {
    id: "sign_in_reminder",
    name: "Sign In Reminder",
    default: false,
    duration: 20,
    file: "20_sec_sign_in_reminder.mp4",
    description: "Adds a 20 second clip reminding the audience to sign the attendance sheet",
    allowedPlacement: { leading: true, trailing: true },
  },
  {
    id: "covid_disclaimer",
    name: "COVID-19 Disclaimer",
    default: false,
    duration: 60,
    file: "1_min_covid.mp4",
    description: "Adds a 1 minute clip, reminding the audience of our COVID-19 guidelines, before playing the first episode of the block",
    allowedPlacement: { leading: true },
  },
] as const;

/** 
 * When pruning which clips should be copied on export, this will always be included
 */
export const basicPauseClipFileName = "30_min_pause.mp4";

export const PathName = {
  UserProjectsDir: await path.join(await path.appDataDir(), "projects"),
  ClipsDir: await path.resolveResource("video-assets"),
} as const;
export type PathName = (typeof PathName)[keyof typeof PathName];

export const FileName = {
  ProjectMeta: "meta.json",
  ProjectData: "project.json",
  RevealTarget: ".target",
} as const;
export type FileName = (typeof FileName)[keyof typeof FileName];

export const ExportNames = {
  SaveFile: "project-data.json",
  EpisodeDir: "episodes",
  SaveDir: "save-files",
  ClipsDir: "clips",
  PlayFileSh: "play.sh",
  PlayFilePs1: "play.ps1",
} as const;
export type ExportNames = (typeof ExportNames)[keyof typeof ExportNames];
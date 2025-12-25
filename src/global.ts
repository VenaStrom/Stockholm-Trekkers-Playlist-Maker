import { path } from "@tauri-apps/api";
import { appDataDir } from "@tauri-apps/api/path";
import { BlockClip, leading, trailing } from "./types";

export const OPTION_REVISION = 0;

/** 
 * Add another entry here to define the clip, and then reference it in BlockOptions below for it to appear in the UI
 */
export const blockClips: Record<string, BlockClip> = {
  Countdown: {
    name: "Countdown",
    default: true,
    duration: 60,
    file: "1_min_countdown.mp4",
    description: "Adds a 1 minute countdown before playing the first episode of the block",
    allowedPlacement: { leading, },
  },
  EmergencyRoutine: {
    name: "Emergency Routine",
    default: true,
    duration: 59,
    file: "1_min_emergency.mp4",
    description: "Adds a 1 minute clip, describing our emergency routines, before playing the first episode of the block",
    allowedPlacement: { leading, trailing, },
  },
  SignInReminder: {
    name: "Sign In Reminder",
    default: false,
    duration: 20,
    file: "20_sec_sign_in_reminder.mp4",
    description: "Adds a 20 second clip, reminding the audience to sign the attendance sheet, after the last episode of the block",
    allowedPlacement: { trailing, },
  },
  CovidDisclaimer: {
    name: "COVID-19 Disclaimer",
    default: false,
    duration: 60,
    file: "1_min_covid.mp4",
    description: "Adds a 1 minute clip, reminding the audience of our COVID-19 guidelines, before playing the first episode of the block",
    allowedPlacement: { leading, },
  },
} as const;

export const PathName = {
  UserProjectsDir: await path.join(await appDataDir(), "projects"),
} as const;
export type PathName = (typeof PathName)[keyof typeof PathName];

export const FileName = {
  ProjectDB: "project.json",
} as const;
export type FileName = (typeof FileName)[keyof typeof FileName];

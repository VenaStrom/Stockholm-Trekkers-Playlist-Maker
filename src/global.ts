import { path } from "@tauri-apps/api";
import { appDataDir } from "@tauri-apps/api/path";

export const OPTION_REVISION = 0;

export const PathName = {
  UserProjectsDir: await path.join(await appDataDir(), "projects"),
} as const;
export type PathName = (typeof PathName)[keyof typeof PathName];

export const FileName = {
  ProjectSave: "project.db",
} as const;
export type FileName = (typeof FileName)[keyof typeof FileName];
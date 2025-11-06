
export const DirName = {
  Projects: "projects",
} as const;
export type DirName = (typeof DirName)[keyof typeof DirName];

export const FileName = {
  ProjectSave: "project.json",
} as const;
export type FileName = (typeof FileName)[keyof typeof FileName];
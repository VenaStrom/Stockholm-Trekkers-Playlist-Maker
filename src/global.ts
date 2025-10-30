
export const DirName = {
  Projects: "projects",
} as const;
export type DirName = (typeof DirName)[keyof typeof DirName];
import type { Encoding } from "@/types";

export type Episode = {
  id: string;
  blockID: string;
  filePath?: string;

  // Calculated
  cachedStartTime?: string;
  cachedEndTime?: string;

  // Probed meta
  cachedDuration?: number; // in seconds
  cachedSize?: number; // in bytes
  cachedEncoding?: Encoding;
};

export type BlockClip = {
  id: string;
  name: string; // Display name
  default: boolean;
  value?: number;
  duration: number; // In seconds
  file: string; // Path in the exported bundle, probs clips/
  description: string;
  allowedPlacement: { leading?: boolean; trailing?: boolean; wrapped?: boolean; }
};

export type Block = {
  id: string;
  options: Record<Block["id"], BlockClip["default"]>;
  startTime?: string;
};

export type ProjectMeta = {
  id: string;
  date: string;
  description: string;
  dateCreated: number; // unix timestamp
  dateModified?: number; // unix timestamp
  optionsRev: number;
  blockCount: number;
  episodeCount: number;
  exportSize?: number; // in bytes
};
export type ProjectData = {
  id: string;
  blocks: Block[];
  episodes: Episode[];
};
export type Project = ProjectMeta & Omit<ProjectData, "id">;

export type Episode = {
  id: string;
  blockID: string;
  filePath?: string;
  duration?: number; // in seconds
  cachedStartTime?: string;
  cachedEndTime?: string;
};

export type BlockClip = {
  name: string; // Display name
  default: boolean | number; // Mostly gonna be checkboxes but some configs would like numbers
  duration: number; // In seconds
  file: string; // Path in the asset bundle
  description: string;
  allowedPlacement: { leading?: boolean; trailing?: boolean; wrapped?: boolean; }
};

export type Block = {
  id: string;
  options: Record<string, BlockClip["default"]>;
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
};
export type ProjectData = {
  id: string;
  blocks: Block[];
  episodes: Episode[];
};
export type Project = ProjectMeta & Omit<ProjectData, "id">;
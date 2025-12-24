
export type Episode = {
  id: string;
  order: number;
  blockId: string;
  filePath: string | null;
  duration: number | null; // in seconds
  cachedStartTime: number | null; // in seconds
  cachedEndTime: number | null; // in seconds
};

export type Block = {
  id: string;
  options: Record<string, boolean>;
  nextBlockId?: string;
};

export type Project = {
  id: string;
  date: string;
  description: string | null;
  dateCreated: number; // unix timestamp
  dateModified: number | null; // unix timestamp
  optionsRev: number;
  blocks: Block[];
  episodes: Episode[];
};
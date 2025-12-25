import { blockClips } from "./global";

export type Episode = {
  id: string;
  nextEpisodeId?: string;
  blockId: string;
  filePath: string | null;
  duration: number | null; // in seconds
  cachedStartTime: number | null; // in seconds
  cachedEndTime: number | null; // in seconds
};

export const leading = true, trailing = true, wrapped = true;
export type BlockClip = {
  name: string; // Display name
  default: boolean | number; // Mostly gonna be checkboxes but some configs would like numbers
  duration: number; // In seconds
  file: string; // Path in the asset bundle
  description: string;
  allowedPlacement: { leading?: boolean; trailing?: boolean; wrapped?: boolean; }
};

export const DefaultBlockOptions: Record<string, BlockClip["default"]> = {} as const;
for (const clipKey in blockClips) {
  if (!blockClips[clipKey]) continue;
  for (const placement in blockClips[clipKey].allowedPlacement) {
    const optionKey = `${placement}_${clipKey}`;
    DefaultBlockOptions[optionKey] = blockClips[clipKey].default;
  }
}
export type DefaultBlockOptions = typeof DefaultBlockOptions;

export type Block = {
  id: string;
  options: Record<string, BlockClip["default"]>;
  nextBlockId?: string;
};

export type Project = {
  id: string;
  date: string;
  description: string;
  dateCreated: number; // unix timestamp
  dateModified?: number; // unix timestamp
  optionsRev: number;
  blocks: Block[];
  episodes: Episode[];
};
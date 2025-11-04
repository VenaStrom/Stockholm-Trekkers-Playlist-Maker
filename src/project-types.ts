import { generateId } from "./functions/sha256";

export type Episode = {
  id: string;
  filePath: string | null;
  duration: number | null; // in seconds
  cachedStartTime: number | null; // in seconds
  cachedEndTime: number | null; // in seconds
};
const emptyEpisode: Episode = {
  id: "",
  filePath: null,
  duration: null,
  cachedStartTime: null,
  cachedEndTime: null,
};
export function getEmptyEpisode(): Episode {
  return { ...emptyEpisode, id: generateId(), };
}

export type Block = {
  id: string;
  options: Record<string, boolean>;
  episodes: Episode[];
};
const emptyBlock: Block = {
  id: "",
  options: {},
  episodes: [],
};
export function getEmptyBlock(episodeCount = 2): Block {
  return { ...emptyBlock, id: generateId(), episodes: Array.from({ length: episodeCount }, () => getEmptyEpisode()), };
}

export type Project = {
  id: string;
  date: string;
  description: string | null;
  dateCreated: number; // unix timestamp
  dateModified: number | null; // unix timestamp
  optionsRev: number;
  blocks: Block[];
};
const emptyProject: Project = {
  id: "",
  date: "",
  description: null,
  dateCreated: 0,
  dateModified: null,
  optionsRev: 0,
  blocks: [
    { ...getEmptyBlock() },
  ],
};
export function getEmptyProject(blockCount = 2, episodePerBlockCount = 2): Project {
  return { ...emptyProject, id: generateId(), dateCreated: Date.now(), blocks: Array.from({ length: blockCount }, () => getEmptyBlock(episodePerBlockCount)), };
}
import { generateId } from "./functions/sha256";

export const OPTION_REVISION = 0;

export type Episode = {
  id: string;
  order: number;
  blockId: string;
  filePath: string | null;
  duration: number | null; // in seconds
  cachedStartTime: number | null; // in seconds
  cachedEndTime: number | null; // in seconds
};
const emptyEpisode: Episode = {
  id: "",
  blockId: "",
  order: Infinity,
  filePath: null,
  duration: null,
  cachedStartTime: null,
  cachedEndTime: null,
};
export function getEmptyEpisode(blockId: string, order?: number): Episode {
  return { ...emptyEpisode, id: generateId(), blockId: blockId, ...order ? { order } : {}, };
}

export type Block = {
  id: string;
  options: Record<string, boolean>;
  order: number;
};
const emptyBlock: Block = {
  id: "",
  options: {},
  order: Infinity,
};
export function getEmptyBlock(order?: number): Block {
  return { ...emptyBlock, id: generateId(), ...order ? { order } : {} };
}

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
const emptyProject: Project = {
  id: "",
  date: "",
  description: null,
  dateCreated: 0,
  dateModified: null,
  optionsRev: OPTION_REVISION,
  blocks: [],
  episodes: [],
};
export function getEmptyProject(): Project {
  const block1 = getEmptyBlock(0);
  const block2 = getEmptyBlock(1);
  const episode1 = getEmptyEpisode(block1.id, 0);
  const episode2 = getEmptyEpisode(block1.id, 1);
  const episode3 = getEmptyEpisode(block2.id, 0);
  const episode4 = getEmptyEpisode(block2.id, 1);
  return {
    ...emptyProject,
    id: generateId(),
    dateCreated: Date.now(),
    blocks: [block1, block2],
    episodes: [episode1, episode2, episode3, episode4],
  };
}
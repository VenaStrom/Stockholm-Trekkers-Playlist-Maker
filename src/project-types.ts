import { generateId } from "./functions/sha256";

export type Episode = {
  id: string;
  blockId: string;
  filePath: string | null;
  duration: number | null; // in seconds
  cachedStartTime: number | null; // in seconds
  cachedEndTime: number | null; // in seconds
};
const emptyEpisode: Episode = {
  id: "",
  blockId: "",
  filePath: null,
  duration: null,
  cachedStartTime: null,
  cachedEndTime: null,
};
export function getEmptyEpisode(blockId: string): Episode {
  return { ...emptyEpisode, id: generateId(), blockId: blockId };
}

export type Block = {
  id: string;
  options: Record<string, boolean>;
};
const emptyBlock: Block = {
  id: "",
  options: {},
};
export function getEmptyBlock(): Block {
  return { ...emptyBlock, id: generateId(), };
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
  optionsRev: 0,
  blocks: [],
  episodes: [],
};
export function getEmptyProject(): Project {
  const block1 = getEmptyBlock();
  const block2 = getEmptyBlock();
  const episode1 = getEmptyEpisode(block1.id);
  const episode2 = getEmptyEpisode(block1.id);
  const episode3 = getEmptyEpisode(block2.id);
  const episode4 = getEmptyEpisode(block2.id);
  return {
    ...emptyProject,
    id: generateId(),
    dateCreated: Date.now(),
    blocks: [block1, block2],
    episodes: [episode1, episode2, episode3, episode4],
  };
}
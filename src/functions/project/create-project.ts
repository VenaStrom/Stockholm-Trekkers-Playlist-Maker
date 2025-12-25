import { DefaultBlockOptions, Project } from "@/types";
import { generateId } from "@/functions/sha256";
import { OPTION_REVISION } from "@/global";

/** 
 * @returns Project ID
 */
export async function createProject(): Promise<Project> {

  const blockIds: [string, string] = [generateId(), generateId()];
  const episodeIds: [string, string, string, string] = [generateId(), generateId(), generateId(), generateId()];

  const project: Project = {
    id: generateId(),
    date: "",
    description: "",
    dateCreated: Date.now(),
    optionsRev: OPTION_REVISION,
    blocks: blockIds.map((blockId, index) => ({
      id: blockId,
      nextBlockId: blockIds[index + 1],
      options: { ...DefaultBlockOptions },
    })),
    episodes: episodeIds.map((episodeId, index) => ({
      id: episodeId,
      nextEpisodeId: episodeIds[index + 1],
      blockId: blockIds[index < 2 ? 0 : 1] ?? blockIds[0],
      filePath: null,
      duration: null,
      cachedStartTime: null,
      cachedEndTime: null,
    })),
  };

  return project;
}
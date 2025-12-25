import { DefaultBlockOptions, Project } from "@/types";
import { generateId } from "@/functions/sha256";
import { OPTION_REVISION } from "@/global";
import * as fs from "@tauri-apps/plugin-fs";
import { path } from "@tauri-apps/api";
import { PathName, FileName } from "@/global";

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

  // Write to file
  const projectDir = await path.join(PathName.UserProjectsDir, project.id);
  if (await fs.exists(projectDir)) {
    throw new Error(`Project directory already exists: ${projectDir}, please resolve manually.`);
  }
  await fs.mkdir(projectDir, { recursive: true });
  const projectFilePath = await path.join(projectDir, FileName.ProjectDB);
  await fs.writeTextFile(projectFilePath, JSON.stringify(project, null, 2));

  return project;
}
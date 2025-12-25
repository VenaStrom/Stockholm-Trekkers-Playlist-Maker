import { DefaultBlockOptions, ProjectData, Project, ProjectMeta } from "@/types";
import { generateId } from "@/functions/sha256";
import { OPTION_REVISION } from "@/global";
import * as fs from "@tauri-apps/plugin-fs";
import { path } from "@tauri-apps/api";
import { PathName, FileName } from "@/global";
import { isProject } from "@/functions/type-guards";

export async function createProject(): Promise<Project> {
  const projectId = generateId();
  const blockIds: [string, string] = [generateId(), generateId()];
  const episodeIds: [string, string, string, string] = [generateId(), generateId(), generateId(), generateId()];

  const projectMeta: ProjectMeta = {
    id: projectId,
    date: "",
    description: "",
    dateCreated: Date.now(),
    optionsRev: OPTION_REVISION,
  };
  const projectData: ProjectData = {
    id: projectId,
    blocks: blockIds.map((blockId, index) => ({
      id: blockId,
      nextBlockId: blockIds[index + 1],
      options: { ...DefaultBlockOptions },
    })),
    episodes: episodeIds.map((episodeId, index) => ({
      id: episodeId,
      blockId: blockIds[index < 2 ? 0 : 1] ?? blockIds[0],
      nextEpisodeId: episodeIds[index + 1],
    })),
  };

  // Write to file
  const projectDir = await path.join(PathName.UserProjectsDir, projectMeta.id);
  if (await fs.exists(projectDir)) {
    throw new Error(`Project directory already exists: ${projectDir}, please resolve manually.`);
  }
  await fs.mkdir(projectDir, { recursive: true });
  const metaFilePath = await path.join(projectDir, FileName.ProjectMeta);
  await fs.writeTextFile(metaFilePath, JSON.stringify(projectMeta, null, 2));
  const dataFilePath = await path.join(projectDir, FileName.ProjectData);
  await fs.writeTextFile(dataFilePath, JSON.stringify(projectData, null, 2));

  const mergedProject: Project = {
    ...projectMeta,
    ...projectData,
  };

  if (!isProject) {
    throw new Error("Created project is invalid.");
  }

  return mergedProject;
}
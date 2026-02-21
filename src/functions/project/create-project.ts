import { DefaultBlockOptions } from "@/consts";
import type { ProjectData, Project, ProjectMeta } from "@/types";
import { generateID } from "@/functions/sha256";
import { OPTION_REVISION } from "@/global";
import * as fs from "@tauri-apps/plugin-fs";
import { path } from "@tauri-apps/api";
import { PathName, FileName } from "@/global";
import { isProject } from "@/functions/type-guards";

export async function createProject(): Promise<Project> {
  const projectID = generateID();
  const blockIDs: [string, string] = [generateID(), generateID()];
  const episodeIDs: [string, string, string, string] = [generateID(), generateID(), generateID(), generateID()];

  const projectMeta: ProjectMeta = {
    id: projectID,
    date: "",
    description: "",
    dateCreated: Date.now(),
    optionsRev: OPTION_REVISION,
    blockCount: 0,
    episodeCount: 0,
  };
  const projectData: ProjectData = {
    id: projectID,
    blocks: blockIDs.map(blockID => ({
      id: blockID,
      options: { ...DefaultBlockOptions },
    })),
    episodes: episodeIDs.map((episodeID, index) => ({
      id: episodeID,
      blockID: blockIDs[index < 2 ? 0 : 1] ?? blockIDs[0],
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
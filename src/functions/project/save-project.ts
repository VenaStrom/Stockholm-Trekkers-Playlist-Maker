import * as fs from "@tauri-apps/plugin-fs";
import { path } from "@tauri-apps/api";
import { PathName, FileName } from "@/global";
import { isProject } from "../type-guards";
import type { Project, ProjectData, ProjectMeta } from "@/types";
import { createProject } from "./create-project";

export async function saveProject(project: Project): Promise<void> {
  if (!isProject(project)) {
    throw new Error("Project data is invalid and cannot be saved.");
  }

  const projectDir = await path.join(PathName.UserProjectsDir, project.id);
  if (!await fs.exists(projectDir)) {
    console.warn(`Project directory does not exist: ${projectDir}. Creating the directory.`);
    await createProject();
  }
  const metaFilePath = await path.join(projectDir, FileName.ProjectMeta);
  const dataFilePath = await path.join(projectDir, FileName.ProjectData);

  // Used for meta stats, not to override the actual data
  const truthyEpisodes = project.episodes.filter(e => e.filePath);
  const blocksWithEpisodes = project.blocks.filter(b => truthyEpisodes.some(e => e.blockId === b.id));

  const projectMeta: ProjectMeta = {
    id: project.id,
    date: project.date,
    description: project.description,
    dateCreated: project.dateCreated,
    optionsRev: project.optionsRev,
    blockCount: blocksWithEpisodes.length,
    episodeCount: truthyEpisodes.length,
  };

  const projectData: ProjectData = {
    id: project.id,
    blocks: project.blocks,
    episodes: project.episodes,
  };

  if (!isProject({ ...projectMeta, ...projectData })) {
    throw new Error("Reordered project data is invalid and cannot be saved.");
  }

  await fs.writeTextFile(metaFilePath, JSON.stringify(projectMeta, null, 2));
  await fs.writeTextFile(dataFilePath, JSON.stringify(projectData, null, 2));
}
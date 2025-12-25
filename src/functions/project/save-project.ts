import * as fs from "@tauri-apps/plugin-fs";
import { path } from "@tauri-apps/api";
import { PathName, FileName } from "@/global";
import { isProject } from "../type-guards";
import type { Project, ProjectData, ProjectMeta } from "@/types";
import { createProject } from "./create-project";

export async function saveProject(project: Project): Promise<void> {
  const projectDir = await path.join(PathName.UserProjectsDir, project.id);
  if (!await fs.exists(projectDir)) {
    console.warn(`Project directory does not exist: ${projectDir}. Creating the directory.`);
    await createProject();
  }
  const metaFilePath = await path.join(projectDir, FileName.ProjectMeta);
  const dataFilePath = await path.join(projectDir, FileName.ProjectData);

  const normalizedProject: Project = {
    ...project,
    blocks: project.blocks.map((b) => ({
      ...b,
      nextBlockId: typeof b.nextBlockId === "string" ? b.nextBlockId : undefined,
    })),
    episodes: project.episodes.map((ep) => ({
      ...ep,
      nextEpisodeId: typeof ep.nextEpisodeId === "string" ? ep.nextEpisodeId : undefined,
    })),
  };

  if (!isProject(normalizedProject)) {
    throw new Error("Project data is invalid and cannot be saved.");
  }

  const projectMeta: ProjectMeta = {
    id: project.id,
    date: project.date,
    description: project.description,
    dateCreated: project.dateCreated,
    optionsRev: project.optionsRev,
  };

  const projectData: ProjectData = {
    id: project.id,
    blocks: normalizedProject.blocks,
    episodes: normalizedProject.episodes,
  };

  await fs.writeTextFile(metaFilePath, JSON.stringify(projectMeta, null, 2));
  await fs.writeTextFile(dataFilePath, JSON.stringify(projectData, null, 2));
}
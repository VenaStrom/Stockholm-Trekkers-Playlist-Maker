import { getAllProjectIds } from "@/functions/project/get-all-projects";
import * as fs from "@tauri-apps/plugin-fs";
import { path } from "@tauri-apps/api";
import { PathName, FileName } from "@/global";
import { isProject, isProjectMetaOnly } from "@/functions/type-guards";
import type { Project, ProjectMeta } from "@/types";

export async function openProject(projectId: string): Promise<Project> {
  const project = await internalOpenProject(projectId, true);
  if (!isProject(project)) {
    throw new Error(`Project format invalid for project ID: ${projectId}`);
  }
  return project;
}
export async function openProjectMetaOnly(projectId: string): Promise<ProjectMeta> {
  const projectMeta = await internalOpenProject(projectId, false);
  if (!isProjectMetaOnly(projectMeta)) {
    throw new Error(`Project meta only format invalid for project ID: ${projectId}`);
  }
  return projectMeta;
}

async function internalOpenProject(projectId: string, includeData = true): Promise<Project | ProjectMeta> {
  const allProjectIds = await getAllProjectIds();
  if (!allProjectIds.has(projectId)) {
    throw new Error(`Project with ID ${projectId} does not exist.`);
  }

  const projectMetaFilePath = await path.join(PathName.UserProjectsDir, projectId, FileName.ProjectMeta);
  if (!await fs.exists(projectMetaFilePath)) {
    throw new Error(`Project file does not exist at path: ${projectMetaFilePath}`);
  }

  const metaFileContent = await fs.readTextFile(projectMetaFilePath);
  try {
    JSON.parse(metaFileContent);
  }
  catch (e: unknown) {
    throw new Error(`Failed to parse project file for project ID: ${projectId}. Error: ${e instanceof Error ? e.message : String(e)}`);
  }
  const projectMeta: unknown = JSON.parse(metaFileContent);

  if (typeof projectMeta !== "object" || projectMeta === null) {
    throw new Error(`Invalid project meta format for project ID: ${projectId}`);
  }

  if (!isProjectMetaOnly(projectMeta)) {
    throw new Error(`Invalid project file format for project ID: ${projectId}`);
  }

  if (!includeData) {
    return projectMeta;
  }

  const projectDataFilePath = await path.join(PathName.UserProjectsDir, projectId, FileName.ProjectData);

  if (!await fs.exists(projectDataFilePath)) {
    throw new Error(`Project data file does not exist at path: ${projectDataFilePath}`);
  }

  const dataFileContent = await fs.readTextFile(projectDataFilePath);
  try {
    JSON.parse(dataFileContent);
  }
  catch (e: unknown) {
    throw new Error(`Failed to parse project data file for project ID: ${projectId}. Error: ${e instanceof Error ? e.message : String(e)}`);
  }

  const projectData: unknown = JSON.parse(dataFileContent);

  if (typeof projectData !== "object" || projectData === null) {
    throw new Error(`Invalid project data format for project ID: ${projectId}`);
  }

  const fullProject: unknown = { ...projectMeta, ...projectData };

  if (!isProject(fullProject)) {
    throw new Error(`Invalid full project format for project ID: ${projectId}`);
  }

  // Normalize block and episode orders so their array order matches their linked order
  const reorderedBlocks: Project["blocks"] = [];
  const blockById = new Map(fullProject.blocks.map(b => [b.id, b]));
  const pointedBlocks = new Set(fullProject.blocks.map(b => b.nextBlockId).filter(Boolean) as string[]);
  const headBlocks = fullProject.blocks.filter(b => !pointedBlocks.has(b.id));
  for (const head of headBlocks) {
    let current: typeof fullProject.blocks[number] | undefined = head;
    const seen = new Set<string>();
    while (current && !seen.has(current.id)) {
      reorderedBlocks.push(current);
      seen.add(current.id);
      const nextId: string | undefined = current.nextBlockId;
      current = nextId ? blockById.get(nextId) : undefined;
    }
  }
  // Append any orphaned blocks not reachable from heads
  for (const block of fullProject.blocks) {
    if (!reorderedBlocks.find(x => x.id === block.id)) {
      reorderedBlocks.push(block);
    }
  }
  fullProject.blocks = reorderedBlocks;

  const reorderedEpisodes: Project["episodes"] = [];
  const episodeById = new Map(fullProject.episodes.map(e => [e.id, e]));
  const pointedEpisodes = new Set(fullProject.episodes.map(e => e.nextEpisodeId).filter(Boolean) as string[]);
  const headEpisodes = fullProject.episodes.filter(e => !pointedEpisodes.has(e.id));
  for (const head of headEpisodes) {
    let current: typeof fullProject.episodes[number] | undefined = head;
    const seen = new Set<string>();
    while (current && !seen.has(current.id)) {
      reorderedEpisodes.push(current);
      seen.add(current.id);
      const nextId: string | undefined = current.nextEpisodeId;
      current = nextId ? episodeById.get(nextId) : undefined;
    }
  }
  // Append any orphaned episodes not reachable from heads
  for (const episode of fullProject.episodes) {
    if (!reorderedEpisodes.find(x => x.id === episode.id)) {
      reorderedEpisodes.push(episode);
    }
  }
  fullProject.episodes = reorderedEpisodes;

  return fullProject;
}
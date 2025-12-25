import * as fs from "@tauri-apps/plugin-fs";
import { path } from "@tauri-apps/api";
import { PathName, FileName } from "@/global";
import { isProject } from "../type-guards";
import type { Block, Episode, Project, ProjectData, ProjectMeta } from "@/types";
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

  // Order blocks and episodes in their arrays based on linking
  const orderedBlocks: Block[] = [];
  const blockById = new Map(project.blocks.map(b => [b.id, b]));
  const pointedBlocks = new Set(project.blocks.map(b => b.nextBlockId).filter(Boolean));
  const headBlocks = project.blocks.filter(b => !pointedBlocks.has(b.id));

  for (const head of headBlocks) {
    let current: typeof head | undefined = head;
    const seen = new Set<string>();
    while (current && !seen.has(current.id)) {
      orderedBlocks.push(current);
      seen.add(current.id);
      const nextId: string | undefined = current.nextBlockId;
      current = nextId ? blockById.get(nextId) : undefined;
    }
  }
  // Append any orphaned blocks not reachable from heads
  for (const block of project.blocks) {
    if (!orderedBlocks.find(x => x.id === block.id)) {
      orderedBlocks.push({ ...block, nextBlockId: undefined });
    }
  }

  const orderedEpisodes: Episode[] = [];
  const episodeById = new Map(project.episodes.map(e => [e.id, e]));
  const pointedEpisodes = new Set(project.episodes.map(e => e.nextEpisodeId).filter(Boolean));
  const headEpisodes = project.episodes.filter(e => !pointedEpisodes.has(e.id));
  for (const head of headEpisodes) {
    let current: typeof head | undefined = head;
    const seen = new Set<string>();
    while (current && !seen.has(current.id)) {
      orderedEpisodes.push(current);
      seen.add(current.id);
      const nextId: string | undefined = current.nextEpisodeId;
      current = nextId ? episodeById.get(nextId) : undefined;
    }
  }
  // Append any orphaned episodes not reachable from heads
  for (const episode of project.episodes) {
    if (!orderedEpisodes.find(x => x.id === episode.id)) {
      orderedEpisodes.push({ ...episode, nextEpisodeId: undefined });
    }
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
    blocks: orderedBlocks,
    episodes: orderedEpisodes,
  };

  if (!isProject({ ...projectMeta, ...projectData })) {
    throw new Error("Reordered project data is invalid and cannot be saved.");
  }

  await fs.writeTextFile(metaFilePath, JSON.stringify(projectMeta, null, 2));
  await fs.writeTextFile(dataFilePath, JSON.stringify(projectData, null, 2));
}
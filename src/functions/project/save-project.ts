import * as fs from "@tauri-apps/plugin-fs";
import { path } from "@tauri-apps/api";
import { PathName, FileName } from "@/global";
import { isProject } from "@/functions/type-guards";
import type { Episode, Project, ProjectData, ProjectMeta } from "@/types";
import { createProject, openProject } from "@/functions/project";
import { generateId } from "@/functions/sha256";

export async function saveProject(project: Project): Promise<boolean> {
  const start = performance.now();
  console.info(`[SaveProject] Starting save for project ${project.id}...`);

  const projectCopy = JSON.parse(JSON.stringify(project)) as Project;

  // Skip if unchanged
  const oldProject = await openProject(project.id);
  if (JSON.stringify(oldProject) === JSON.stringify(projectCopy)) {
    console.info(`[SaveProject] No changes detected in project. Skipping save. (${(performance.now() - start).toFixed(2)} ms)`);
    return false;
  }

  if (!isProject(projectCopy)) {
    throw new Error("[SaveProject] Project data is invalid and cannot be saved. Aborting save.");
  }

  // If dupe episodes or blocks exist, warn and remove the dupe with the least data
  const episodesById: Record<string, Episode[]> = {};
  projectCopy.episodes.forEach(e => {
    const id = e.id;
    episodesById[id] ??= [];
    episodesById[id].push(e);
  });
  for (const [id, episodes] of Object.entries(episodesById)) {
    if (episodes.length > 1) {
      console.warn(`[SaveProject] Duplicate episodes found with id ${id}. Keeping the episode with the most data.`);
      episodes.sort((a, b) => {
        const aDataCount = Object.values(a).filter(v => v).length;
        const bDataCount = Object.values(b).filter(v => v).length;
        return bDataCount - aDataCount;
      });
      const [_keep, ...dupes] = episodes;
      projectCopy.episodes = projectCopy.episodes.filter(e => e !== dupes[0]);
    }
  }
  const blocksById: Record<string, number> = {};
  projectCopy.blocks.forEach(b => {
    const id = b.id;
    blocksById[id] ??= 0;
    blocksById[id]++;
  });
  for (const [id, count] of Object.entries(blocksById)) {
    if (count > 1) {
      console.warn(`[SaveProject] Duplicate blocks found with id ${id}. Removing duplicates.`);
      let firstFound = false;
      projectCopy.blocks = projectCopy.blocks.filter(b => {
        if (b.id === id) {
          if (!firstFound) {
            firstFound = true;
            return true;
          }
          return false;
        }
        return true;
      });
    }
  }

  // Sort episodes so they are clumped by block id
  const episodesSorted: Episode[] = [];
  projectCopy.blocks.forEach(block => {
    const episodesInBlock = projectCopy.episodes.filter(e => e.blockId === block.id);
    episodesSorted.push(...episodesInBlock);
  });
  projectCopy.episodes = episodesSorted;

  // Ensure trailing empty episode per block
  projectCopy.blocks.forEach(block => {
    const episodesInBlock = projectCopy.episodes.filter(e => e.blockId === block.id);
    const hasTrailingEmpty = episodesInBlock.at(-1)?.filePath ? false : true;
    if (!hasTrailingEmpty) {
      const newEpisode: Episode = {
        id: generateId(),
        blockId: block.id,
      };
      projectCopy.episodes.push(newEpisode);
    }
  });

  // Construct meta and data
  const projectMeta: ProjectMeta = {
    id: projectCopy.id,
    date: projectCopy.date,
    description: projectCopy.description,
    dateCreated: projectCopy.dateCreated,
    optionsRev: projectCopy.optionsRev,
    blockCount: projectCopy.blocks.length,
    episodeCount: projectCopy.episodes.filter(e => e.filePath).length,
  };
  const projectData: ProjectData = {
    id: projectCopy.id,
    blocks: projectCopy.blocks,
    episodes: projectCopy.episodes,
  };

  if (!isProject({ ...projectMeta, ...projectData })) {
    throw new Error("[SaveProject] Combined project data is invalid. Aborting save.");
  }

  const projectDir = await path.join(PathName.UserProjectsDir, projectCopy.id);
  if (!await fs.exists(projectDir)) {
    console.warn(`[SaveProject] Project directory does not exist: ${projectDir}. Creating the directory. How are you saving a project that doesn't exist?`);
    await createProject();
  }
  const metaFilePath = await path.join(projectDir, FileName.ProjectMeta);
  const dataFilePath = await path.join(projectDir, FileName.ProjectData);

  await fs.writeTextFile(metaFilePath, JSON.stringify(projectMeta, null, 2));
  await fs.writeTextFile(dataFilePath, JSON.stringify(projectData, null, 2));

  console.info(`[SaveProject] Project ${projectCopy.id} saved successfully. (${(performance.now() - start).toFixed(2)} ms)`);
  return true;
}
import * as fs from "@tauri-apps/plugin-fs";
import { path } from "@tauri-apps/api";
import { PathName, FileName } from "@/global";
import { isProject } from "../type-guards";
import type { Episode, Project, ProjectData, ProjectMeta } from "@/types";
import { createProject } from "./create-project";

export async function saveProject(project: Project): Promise<void> {
  if (!isProject(project)) {
    throw new Error("Project data is invalid and cannot be saved.");
  }

  // If dupe episodes or blocks exist, warn and remove the dupe with the least data
  const episodesById:Record<string, Episode[]> = {};
  project.episodes.forEach(e => {
    const id = e.id;
    episodesById[id] ??= [];
    episodesById[id].push(e);
  });
  for (const [id, episodes] of Object.entries(episodesById)) {
    if (episodes.length > 1) {
      console.warn(`Duplicate episodes found with id ${id}. Keeping the episode with the most data.`);
      episodes.sort((a, b) => {
        const aDataCount = Object.values(a).filter(v => v).length;
        const bDataCount = Object.values(b).filter(v => v).length;
        return bDataCount - aDataCount;
      });
      const [_keep, ...dupes] = episodes;
      project.episodes = project.episodes.filter(e => e !== dupes[0]);
    }
  }
  const blocksById:Record<string, number> = {};
  project.blocks.forEach(b => {
    const id = b.id;
    blocksById[id] ??= 0;
    blocksById[id]++;
  });
  for (const [id, count] of Object.entries(blocksById)) {
    if (count > 1) {
      console.warn(`Duplicate blocks found with id ${id}. Removing duplicates.`);
      let firstFound = false;
      project.blocks = project.blocks.filter(b => {
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

  const projectDir = await path.join(PathName.UserProjectsDir, project.id);
  if (!await fs.exists(projectDir)) {
    console.warn(`Project directory does not exist: ${projectDir}. Creating the directory.`);
    await createProject();
  }
  const metaFilePath = await path.join(projectDir, FileName.ProjectMeta);
  const dataFilePath = await path.join(projectDir, FileName.ProjectData);

  // Used for meta stats, not to override the actual data
  const truthyEpisodes = project.episodes.filter(e => e.filePath);
  // const blocksWithEpisodes = project.blocks.filter(b => truthyEpisodes.some(e => e.blockId === b.id));
  const blocksWithEpisodes = project.blocks; // This will include empty blocks since they are structurally more important than episodes

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
import { getAllProjectIds } from "./get-all-projects";
import * as fs from "@tauri-apps/plugin-fs";
import { path } from "@tauri-apps/api";
import { PathName, FileName } from "@/global";
import { isProject } from "../type-guards";
import { Project } from "@/types";

export async function openProject(projectId: string): Promise<Project> {
  const allProjectIds = await getAllProjectIds();
  if (!allProjectIds.has(projectId)) {
    throw new Error(`Project with ID ${projectId} does not exist.`);
  }

  const projectMetaFilePath = await path.join(PathName.UserProjectsDir, projectId, FileName.ProjectMeta);
  if (!await fs.exists(projectMetaFilePath)) {
    throw new Error(`Project file does not exist at path: ${projectMetaFilePath}`);
  }

  const projectDataFilePath = await path.join(PathName.UserProjectsDir, projectId, FileName.ProjectData);
  if (!await fs.exists(projectDataFilePath)) {
    throw new Error(`Project data file does not exist at path: ${projectDataFilePath}`);
  }

  const metaFileContent = await fs.readTextFile(projectMetaFilePath);
  const dataFileContent = await fs.readTextFile(projectDataFilePath);
  try {
    JSON.parse(metaFileContent);
    JSON.parse(dataFileContent);
  }
  catch (e: unknown) {
    throw new Error(`Failed to parse project file for project ID: ${projectId}. Error: ${e instanceof Error ? e.message : String(e)}`);
  }
  const projectMeta: unknown = JSON.parse(metaFileContent);
  const projectData: unknown = JSON.parse(dataFileContent);

  if (typeof projectMeta !== "object" || projectMeta === null) {
    throw new Error(`Invalid project meta format for project ID: ${projectId}`);
  }
  if (typeof projectData !== "object" || projectData === null) {
    throw new Error(`Invalid project data format for project ID: ${projectId}`);
  }

  const projectMetaMerged: unknown = {
    ...projectMeta,
    ...projectData,
  };

  if (!isProject(projectMetaMerged)) {
    throw new Error(`Invalid project file format for project ID: ${projectId}`);
  }
  return projectMetaMerged;
}
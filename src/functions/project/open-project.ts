import { getAllProjectIDs } from "@/functions/project";
import * as fs from "@tauri-apps/plugin-fs";
import { path } from "@tauri-apps/api";
import { PathName, FileName } from "@/global";
import { isProject, isProjectMetaOnly } from "@/functions/type-guards";
import type { Project, ProjectMeta } from "@/types";

export async function openProject(projectID: string): Promise<Project> {
  const project = await internalOpenProject(projectID, true);
  if (!isProject(project)) {
    throw new Error(`Project format invalid for project ID: ${projectID}`);
  }
  return project;
}
export async function openProjectMetaOnly(projectID: string): Promise<ProjectMeta> {
  const projectMeta = await internalOpenProject(projectID, false);
  if (!isProjectMetaOnly(projectMeta)) {
    throw new Error(`Project meta only format invalid for project ID: ${projectID}`);
  }
  return projectMeta;
}

async function internalOpenProject(projectID: string, includeData = true): Promise<Project | ProjectMeta> {
  const allProjectIDs = await getAllProjectIDs();
  if (!allProjectIDs.has(projectID)) {
    throw new Error(`Project with ID ${projectID} does not exist.`);
  }

  const projectMetaFilePath = await path.join(PathName.UserProjectsDir, projectID, FileName.ProjectMeta);
  if (!await fs.exists(projectMetaFilePath)) {
    throw new Error(`Project file does not exist at path: ${projectMetaFilePath}`);
  }

  const metaFileContent = await fs.readTextFile(projectMetaFilePath);
  try {
    JSON.parse(metaFileContent);
  }
  catch (e: unknown) {
    throw new Error(`Failed to parse project file for project ID: ${projectID}. Error: ${e instanceof Error ? e.message : String(e)}`);
  }
  const projectMeta: unknown = JSON.parse(metaFileContent);

  if (typeof projectMeta !== "object" || projectMeta === null) {
    throw new Error(`Invalid project meta format for project ID: ${projectID}`);
  }

  if (!isProjectMetaOnly(projectMeta)) {
    throw new Error(`Invalid project file format for project ID: ${projectID}`);
  }

  if (!includeData) {
    return projectMeta;
  }

  const projectDataFilePath = await path.join(PathName.UserProjectsDir, projectID, FileName.ProjectData);

  if (!await fs.exists(projectDataFilePath)) {
    throw new Error(`Project data file does not exist at path: ${projectDataFilePath}`);
  }

  const dataFileContent = await fs.readTextFile(projectDataFilePath);
  try {
    JSON.parse(dataFileContent);
  }
  catch (e: unknown) {
    throw new Error(`Failed to parse project data file for project ID: ${projectID}. Error: ${e instanceof Error ? e.message : String(e)}`);
  }

  const projectData: unknown = JSON.parse(dataFileContent);

  if (typeof projectData !== "object" || projectData === null) {
    throw new Error(`Invalid project data format for project ID: ${projectID}`);
  }

  const fullProject: unknown = { ...projectMeta, ...projectData };

  if (!isProject(fullProject)) {
    throw new Error(`Invalid full project format for project ID: ${projectID}`);
  }

  return fullProject;
}
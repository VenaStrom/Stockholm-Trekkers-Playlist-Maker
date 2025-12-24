import { PrismaClient } from "@/prisma/generated";
import { createPrismaClient } from "../prisma";
import { getAllProjects } from "./get-all-projects";

export async function openProject(projectId: string): Promise<PrismaClient> {
  const allProjectIds = await getAllProjects();
  if (!allProjectIds.has(projectId)) {
    throw new Error(`Project with ID ${projectId} does not exist.`);
  }
  return createPrismaClient(projectId);
}
import { PrismaClient } from "@/prisma/generated";
import { createPrismaClient } from "../prisma";
import { getAllProjectIds } from "./get-all-projects";

export async function openProject(projectId: string): Promise<PrismaClient> {
  const allProjectIds = await getAllProjectIds();
  if (!allProjectIds.has(projectId)) {
    throw new Error(`Project with ID ${projectId} does not exist.`);
  }
  return createPrismaClient(projectId);
}
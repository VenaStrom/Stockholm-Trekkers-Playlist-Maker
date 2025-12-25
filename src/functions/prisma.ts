import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/prisma/generated/client";
import { FileName, PathName } from "@/global";
import { path } from "@tauri-apps/api";

export async function createPrismaClient(projectId: string): Promise<PrismaClient> {
  const adapter = new PrismaBetterSqlite3({
    url: await path.join(PathName.UserProjectsDir, projectId, FileName.ProjectDB),
  });
  return new PrismaClient({ adapter });
}

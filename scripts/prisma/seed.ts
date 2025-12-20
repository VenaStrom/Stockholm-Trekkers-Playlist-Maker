import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../src/prisma/generated/client.js";

const adapter = new PrismaBetterSqlite3({
  url: process.env["DATABASE_URL"],
});
export const prisma = new PrismaClient({ adapter });


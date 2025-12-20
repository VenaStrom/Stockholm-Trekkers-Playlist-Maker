import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "scripts/prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "scripts/prisma/migrations",
  }
});
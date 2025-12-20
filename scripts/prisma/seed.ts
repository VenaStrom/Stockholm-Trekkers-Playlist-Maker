import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../src/prisma/generated/client.js";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});
export const prisma = new PrismaClient({ adapter });

prisma.$connect().then(async () => {
  console.log("Connected to the database.");

  prisma.$transaction(async (prisma) => {
    console.log("Starting transaction for seeding...");

  })
    .catch((error) => {
      console.error("Transaction error:", error);
      throw error;
    });

  await prisma.$disconnect()
    .catch((error) => {
      console.error("Error during disconnection:", error);
    });
  console.log("Disconnected from the database.");
})
  .catch(async (error) => {
    console.error("Error during connection or seeding:", error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    console.log("Seeding script finished.");
    await prisma.$disconnect().catch(() => {
      console.log("Failed to disconnect prisma client in finally() block, may be a redundant disconnect.");
    });
  });
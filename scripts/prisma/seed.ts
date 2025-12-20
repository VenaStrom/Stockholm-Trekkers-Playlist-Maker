import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../src/prisma/generated/client.js";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});
export const prisma = new PrismaClient({ adapter });

prisma.$connect().then(async () => {
  console.log("Connected to the database.");

  await prisma.$transaction(async (tx) => {
    console.log("Starting transaction for seeding...");

    const episode2_3 = await tx.episode.create({
      data: {
        title: "Episode 3",
        duration: 4500,
        filePath: "/path/to/another_episode3.mp4",
        cachedStartTime: 1766596861,
        cachedEndTime: 1766601364,
        nextId: undefined,
      },
    });
    const episode2_2 = await tx.episode.create({
      data: {
        title: "Episode 2",
        duration: 3900,
        filePath: "/path/to/another_episode2.mp4",
        cachedStartTime: 1766510461,
        cachedEndTime: 1766514364,
        nextId: episode2_3.id,
      },
    });
    const episode2_1 = await tx.episode.create({
      data: {
        title: "Episode 1",
        duration: 3000,
        filePath: "/path/to/another_episode1.mp4",
        cachedStartTime: 1766424061,
        cachedEndTime: 1766427064,
        nextId: episode2_2.id,
      },
    });
    const episode1_2 = await tx.episode.create({
      data: {
        title: "Episode 2",
        duration: 4200,
        filePath: "/path/to/episode2.mp4",
        cachedStartTime: 1766337661,
        cachedEndTime: 1766341864,
        nextId: episode2_1.id,
      },
    });
    const episode1_1 = await tx.episode.create({
      data: {
        title: "Episode 1",
        duration: 3600,
        filePath: "/path/to/episode1.mp4",
        cachedStartTime: 1766251261,
        cachedEndTime: 1766255314,
        nextId: episode1_2.id,
      },
    });

    const block2 = await tx.block.create({
      data: {
        nextId: undefined,
        episodes: {
          connect: [
            { id: episode2_1.id },
            { id: episode2_2.id },
            { id: episode2_3.id },
          ],
        },
      },
    });
    const block1 = await tx.block.create({
      data: {
        nextId: block2.id,
        episodes: {
          connect: [
            { id: episode1_1.id },
            { id: episode1_2.id }
          ],
        },
      },
    });

    const project = await tx.project.create({
      data: {
        date: new Date().toISOString().substring(0, 10),
        dateCreated: Date.now(),
        optionsRev: 0,
        blocks: {
          connect: [
            { id: block1.id },
            { id: block2.id },
          ],
        },
      },
    });
  })
    .catch((error) => {
      console.error("Transaction error:", error);
      throw error;
    });

  console.log("Seeding script finished.");
})
  .catch((error) => {
    console.error("Error during connection or seeding:", error);
    process.exitCode = 1; // Prefer over process.exit(1) for finally block to run
  })
  .finally(async () => {
    console.log("Disconnected from the database.");
    await prisma.$disconnect()
      .catch((e) => {
        console.error("Error during final disconnection:", e);
      });
  });
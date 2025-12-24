import { createPrismaClient } from "@/functions/prisma";
import { generateId } from "../sha256";
import { OPTION_REVISION } from "@/global";

/** 
 * @returns Project ID
 */
export async function createProject(): Promise<string> {
  const dateCreated = Date.now();
  const id = generateId();

  const prisma = await createPrismaClient(id);

  const blockIds = [generateId(), generateId()];

  const project = await prisma.project.create({
    data: {
      id,
      date: "",
      dateCreated,
      optionsRev: OPTION_REVISION,
      blocks: {
        createMany: {
          data: blockIds.map((blockId, index) => ({
            id: blockId,
            nextId: blockIds[index + 1] ?? null,
          })),
        },
      },
    },
  });

  await prisma.$disconnect();

  return project.id;
}
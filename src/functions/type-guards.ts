import { Block, Episode, Project, ProjectData, ProjectMeta } from "@/types";

export function isEpisode(obj: unknown): obj is Episode {
  if (
    !obj
    || typeof obj !== "object"
    || Array.isArray(obj)
  ) {
    console.warn("Episode type check: does not conform to basic object structure");
    return false;
  }

  const episodeKeys: (keyof Episode)[] = ["id", "nextEpisodeId", "blockId", "filePath", "duration", "cachedStartTime", "cachedEndTime"];
  if (
    (("id" satisfies keyof Episode) in obj && typeof obj.id === "string")
    && (("nextEpisodeId" satisfies keyof Episode) in obj && typeof obj.nextEpisodeId === "number")
    && (("blockId" satisfies keyof Episode) in obj && typeof obj.blockId === "string")
    && (("filePath" satisfies keyof Episode) in obj && (typeof obj.filePath === "string" || obj.filePath === null))
    && (("duration" satisfies keyof Episode) in obj && (typeof obj.duration === "number" || obj.duration === null))
    && (("cachedStartTime" satisfies keyof Episode) in obj && (typeof obj.cachedStartTime === "number" || obj.cachedStartTime === null))
    && (("cachedEndTime" satisfies keyof Episode) in obj && (typeof obj.cachedEndTime === "number" || obj.cachedEndTime === null))
  ) {
    return true;
  }

  const missingProps = episodeKeys.filter((key) => !(key in obj));
  console.warn("Episode type check: missing properties:", missingProps, "What was received:", { ...obj });
  return false;
}

export function isBlock(obj: unknown): obj is Block {
  if (
    !obj
    || typeof obj !== "object"
    || Array.isArray(obj)
  ) {
    console.warn("Block type check: does not conform to basic object structure");
    return false;
  }

  const blockKeys: (keyof Block)[] = ["id", "options", "nextBlockId"] as const;
  if (
    (("id" satisfies keyof Block) in obj && typeof obj.id === "string")
    && (("options" satisfies keyof Block) in obj && typeof obj.options === "object" && !Array.isArray(obj.options))
    && (("nextBlockId" satisfies keyof Block) in obj && typeof obj.nextBlockId === "number")
  ) {
    return true;
  }

  const missingProps = blockKeys.filter((key) => !(key in obj));
  console.warn("Block type check: missing properties:", missingProps, "What was received:", { ...obj });
  return false;
}

export function isProject(obj: unknown): obj is Project {
  if (
    !obj
    || typeof obj !== "object"
    || Array.isArray(obj)
  ) {
    console.warn("Project type check: does not conform to basic object structure");
    return false;
  }

  const projectKeys: (keyof Project)[] = ["id", "date", "description", "dateCreated", "dateModified", "optionsRev", "blocks", "episodes"];
  if (
    (("id" satisfies keyof Project) in obj && typeof obj.id === "string")
    && (("date" satisfies keyof Project) in obj && typeof obj.date === "string")
    && (("description" satisfies keyof Project) in obj && (typeof obj.description === "string" || obj.description === null))
    && (("dateCreated" satisfies keyof Project) in obj && typeof obj.dateCreated === "number")
    && (("dateModified" satisfies keyof Project) in obj && (typeof obj.dateModified === "number" || obj.dateModified === null))
    && (("optionsRev" satisfies keyof Project) in obj && typeof obj.optionsRev === "number")
    && (("blocks" satisfies keyof Project) in obj && Array.isArray(obj.blocks) && obj.blocks.every(isBlock))
    && (("episodes" satisfies keyof Project) in obj && Array.isArray(obj.episodes) && obj.episodes.every(isEpisode))
  ) {
    return true;
  }

  const missingProps = projectKeys.filter((key) => !(key in obj));
  console.warn("Project type check: missing properties:", missingProps, "What was received:", { ...obj });
  return false;
}
export function isProjectMetaOnly(obj: unknown): obj is ProjectMeta {
  if (
    !obj
    || typeof obj !== "object"
    || Array.isArray(obj)
  ) {
    console.warn("Project type check: does not conform to basic object structure");
    return false;
  }

  const projectKeys: (keyof ProjectMeta)[] = ["id", "date", "description", "dateCreated", "dateModified", "optionsRev"];
  if (
    (("id" satisfies keyof ProjectMeta) in obj && typeof obj.id === "string")
    && (("date" satisfies keyof ProjectMeta) in obj && typeof obj.date === "string")
    && (("description" satisfies keyof ProjectMeta) in obj && (typeof obj.description === "string" || obj.description === null))
    && (("dateCreated" satisfies keyof ProjectMeta) in obj && typeof obj.dateCreated === "number")
    && (("dateModified" satisfies keyof ProjectMeta) in obj && (typeof obj.dateModified === "number" || obj.dateModified === null))
    && (("optionsRev" satisfies keyof ProjectMeta) in obj && typeof obj.optionsRev === "number")
  ) {
    return true;
  }

  const missingProps = projectKeys.filter((key) => !(key in obj));
  console.warn("Project type check: missing properties:", missingProps, "What was received:", { ...obj });
  return false;
}
export function isProjectDataOnly(obj: unknown): obj is ProjectData {
  if (
    !obj
    || typeof obj !== "object"
    || Array.isArray(obj)
  ) {
    console.warn("ProjectData type check: does not conform to basic object structure");
    return false;
  }

  const projectKeys: (keyof ProjectData)[] = ["id", "blocks", "episodes"];
  if (
    (("id" satisfies keyof ProjectData) in obj && typeof obj.id === "string")
    && (("blocks" satisfies keyof ProjectData) in obj && Array.isArray(obj.blocks) && obj.blocks.every(isBlock))
    && (("episodes" satisfies keyof ProjectData) in obj && Array.isArray(obj.episodes) && obj.episodes.every(isEpisode))
  ) {
    return true;
  }

  const missingProps = projectKeys.filter((key) => !(key in obj));
  console.warn("ProjectData type check: missing properties:", missingProps, "What was received:", { ...obj });
  return false;
}
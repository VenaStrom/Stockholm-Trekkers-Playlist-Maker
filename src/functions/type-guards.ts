import type { Block, Episode, Project, ProjectData, ProjectMeta } from "@/types";

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

export function isEpisode(obj: unknown): obj is Episode {
  if (!isPlainObject(obj)) {
    console.warn("Episode type check: not an object");
    return false;
  }
  const o = obj as {
    id?: unknown;
    blockId?: unknown;
    nextEpisodeId?: unknown;
    filePath?: unknown;
    duration?: unknown;
    cachedStartTime?: unknown;
    cachedEndTime?: unknown;
  };

  if (typeof o.id !== "string") {
    console.warn("Episode missing or invalid 'id'", { obj });
    return false;
  }
  if (typeof o.blockId !== "string") {
    console.warn("Episode missing or invalid 'blockId'", { obj });
    return false;
  }

  if ("nextEpisodeId" in o && typeof o.nextEpisodeId !== "string") {
    console.warn("Episode optional 'nextEpisodeId' is invalid", { obj });
    return false;
  }
  if ("filePath" in o && typeof o.filePath !== "string") {
    console.warn("Episode optional 'filePath' is invalid", { obj });
    return false;
  }
  if ("duration" in o && typeof o.duration !== "number") {
    console.warn("Episode optional 'duration' is invalid", { obj });
    return false;
  }
  if ("cachedStartTime" in o && typeof o.cachedStartTime !== "number") {
    console.warn("Episode optional 'cachedStartTime' is invalid", { obj });
    return false;
  }
  if ("cachedEndTime" in o && typeof o.cachedEndTime !== "number") {
    console.warn("Episode optional 'cachedEndTime' is invalid", { obj });
    return false;
  }

  return true;
}

export function isBlock(obj: unknown): obj is Block {
  if (!isPlainObject(obj)) {
    console.warn("Block type check: not an object");
    return false;
  }
  const o = obj as { id?: unknown; options?: unknown; nextBlockId?: unknown };

  if (typeof o.id !== "string") {
    console.warn("Block missing or invalid 'id'", { obj });
    return false;
  }

  const options = o.options;
  if (!isPlainObject(options)) {
    console.warn("Block missing or invalid 'options'", { obj });
    return false;
  }
  const optionValues = Object.values(options);
  const okOptions = optionValues.every((v) => typeof v === "boolean" || typeof v === "number");
  if (!okOptions) {
    console.warn("Block 'options' contains invalid values (expected boolean|number)", { obj });
    return false;
  }

  if ("nextBlockId" in o && typeof o.nextBlockId !== "string") {
    console.warn("Block optional 'nextBlockId' is invalid", { obj });
    return false;
  }

  return true;
}

export function isProjectMetaOnly(obj: unknown): obj is ProjectMeta {
  if (!isPlainObject(obj)) {
    console.warn("ProjectMeta type check: not an object");
    return false;
  }
  const o = obj as {
    id?: unknown;
    date?: unknown;
    description?: unknown;
    dateCreated?: unknown;
    dateModified?: unknown;
    optionsRev?: unknown;
  };

  if (typeof o.id !== "string") return false;
  if (typeof o.date !== "string") return false;
  if (typeof o.description !== "string") return false;
  if (typeof o.dateCreated !== "number") return false;
  if ("dateModified" in o && typeof o.dateModified !== "number") return false;
  if (typeof o.optionsRev !== "number") return false;

  return true;
}

export function isProjectDataOnly(obj: unknown): obj is ProjectData {
  if (!isPlainObject(obj)) {
    console.warn("ProjectData type check: not an object");
    return false;
  }
  const o = obj as { id?: unknown; blocks?: unknown; episodes?: unknown };

  if (typeof o.id !== "string") {
    console.warn("ProjectData missing or invalid 'id'", { obj });
    return false;
  }

  const blocks = o.blocks;
  if (!Array.isArray(blocks) || !(blocks as unknown[]).every((b) => isBlock(b))) {
    console.warn("ProjectData 'blocks' invalid", { obj });
    return false;
  }

  const episodes = o.episodes;
  if (!Array.isArray(episodes) || !(episodes as unknown[]).every((e) => isEpisode(e))) {
    console.warn("ProjectData 'episodes' invalid", { obj });
    return false;
  }

  return true;
}

export function isProject(obj: unknown): obj is Project {
  if (!isPlainObject(obj)) {
    console.warn("Project type check: not an object");
    return false;
  }
  const o = obj as { blocks?: unknown; episodes?: unknown };

  // Check meta
  if (!isProjectMetaOnly(obj)) return false;

  // Check data (blocks & episodes)
  const blocks = o.blocks;
  if (!Array.isArray(blocks) || !(blocks as unknown[]).every((b) => isBlock(b))) {
    console.warn("Project 'blocks' invalid", { obj });
    return false;
  }
  const episodes = o.episodes;
  if (!Array.isArray(episodes) || !(episodes as unknown[]).every((e) => isEpisode(e))) {
    console.warn("Project 'episodes' invalid", { obj });
    return false;
  }

  return true;
}
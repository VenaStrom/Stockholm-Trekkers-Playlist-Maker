import { Encoding } from "@/types";
import type { Block, Episode, Project, ProjectData, ProjectMeta } from "@/types";

export function isKnownEncoding(value: unknown): value is (typeof Encoding)[keyof typeof Encoding] {
  if (typeof value !== "string") return false;
  return Object.values(Encoding).includes(value as (typeof Encoding)[keyof typeof Encoding]);
}

export function isEncoding(value: unknown): value is Episode["cachedEncoding"] {
  return typeof value === "string";
}

export function isStandardObject(obj: unknown): obj is Record<string, unknown> {
  if (typeof obj !== "object") return false;
  if (obj === null) return false;
  if (Array.isArray(obj)) return false;
  if (obj instanceof Date) return false;
  if (obj instanceof File) return false;
  return true;
}

export function isEpisode(obj: unknown): obj is Episode {
  if (!isStandardObject(obj)) {
    console.warn("Episode type check: not an object");
    return false;
  }
  const o = obj as {
    id?: unknown;
    blockID?: unknown;
    filePath?: unknown;
    cachedStartTime?: unknown;
    cachedEndTime?: unknown;
    cachedDuration?: unknown;
    cachedSize?: unknown;
    cachedEncoding?: unknown;
  };

  if (typeof o.id !== "string") {
    console.warn("Episode missing or invalid 'id'", { obj });
    return false;
  }
  if (typeof o.blockID !== "string") {
    console.warn("Episode missing or invalid 'blockID'", { obj });
    return false;
  }

  if (o.filePath != null && typeof o.filePath !== "string") {
    console.warn("Episode optional 'filePath' is invalid", { obj });
    return false;
  }
  if (o.cachedStartTime != null && typeof o.cachedStartTime !== "string") {
    console.warn("Episode optional 'cachedStartTime' is invalid", { obj });
    return false;
  }
  if (o.cachedEndTime != null && typeof o.cachedEndTime !== "string") {
    console.warn("Episode optional 'cachedEndTime' is invalid", { obj });
    return false;
  }
  if (o.cachedDuration != null && typeof o.cachedDuration !== "number") {
    console.warn("Episode optional 'cachedDuration' is invalid", { obj });
    return false;
  }
  if (o.cachedSize != null && typeof o.cachedSize !== "number") {
    console.warn("Episode optional 'cachedSize' is invalid", { obj });
    return false;
  }
  if (o.cachedEncoding != null && !isEncoding(o.cachedEncoding)) {
    console.warn("Episode optional 'cachedEncoding' is invalid", { obj });
    return false;
  }

  return true;
}

export function isBlock(obj: unknown): obj is Block {
  if (!isStandardObject(obj)) {
    console.warn("Block type check: not an object");
    return false;
  }
  const o = obj as { id?: unknown; options?: unknown; };

  if (typeof o.id !== "string") {
    console.warn("Block missing or invalid 'id'", { obj });
    return false;
  }

  const options = o.options;
  if (!isStandardObject(options)) {
    console.warn("Block missing or invalid 'options'", { obj });
    return false;
  }
  const optionValues = Object.values(options);
  const okOptions = optionValues.every((v) => typeof v === "boolean" || typeof v === "number");
  if (!okOptions) {
    console.warn("Block 'options' contains invalid values (expected boolean|number)", { obj });
    return false;
  }

  return true;
}

export function isProjectMetaOnly(obj: unknown): obj is ProjectMeta {
  if (!isStandardObject(obj)) {
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
    blockCount?: unknown;
    episodeCount?: unknown;
    exportSize?: unknown;
  };

  if (typeof o.id !== "string") return false;
  if (typeof o.date !== "string") return false;
  if (typeof o.description !== "string") return false;
  if (typeof o.dateCreated !== "number") return false;
  if ("dateModified" in o && typeof o.dateModified !== "number") return false;
  if (typeof o.optionsRev !== "number") return false;
  if (typeof o.blockCount !== "number") return false;
  if (typeof o.episodeCount !== "number") return false;
  if ("exportSize" in o && typeof o.exportSize !== "number") return false;

  return true;
}

export function isProjectDataOnly(obj: unknown): obj is ProjectData {
  if (!isStandardObject(obj)) {
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
  if (!isStandardObject(obj)) {
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
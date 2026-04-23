import { Encoding } from "@/types";
import type { Block, Episode, Project, ProjectData, ProjectMeta } from "@/types";

export function isEncoding(value: unknown): value is Encoding {
  if (typeof value !== "string") return false;

  // Check if it's one of the known encodings
  const knownEncodings: string[] = Object.values(Encoding);
  if (knownEncodings.includes(value)) return true;

  // Allow any string (for future-proofing), but log a warning
  console.warn(`Unknown encoding '${value}' encountered. This may be a future encoding or an invalid value.`);
  return true;
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

  if (!("id" in obj) || typeof obj["id"] !== "string") {
    console.warn("Episode missing or invalid 'id'", { obj });
    return false;
  }
  if (!("blockID" in obj) || typeof obj["blockID"] !== "string") {
    console.warn("Episode missing or invalid 'blockID'", { obj });
    return false;
  }

  if ("filePath" in obj && obj["filePath"] != null && typeof obj["filePath"] !== "string") {
    console.warn("Episode optional 'filePath' is invalid", { obj });
    return false;
  }
  if ("cachedStartTime" in obj && obj["cachedStartTime"] != null && typeof obj["cachedStartTime"] !== "string") {
    console.warn("Episode optional 'cachedStartTime' is invalid", { obj });
    return false;
  }
  if ("cachedEndTime" in obj && obj["cachedEndTime"] != null && typeof obj["cachedEndTime"] !== "string") {
    console.warn("Episode optional 'cachedEndTime' is invalid", { obj });
    return false;
  }
  if ("cachedDuration" in obj && obj["cachedDuration"] != null && typeof obj["cachedDuration"] !== "number") {
    console.warn("Episode optional 'cachedDuration' is invalid", { obj });
    return false;
  }
  if ("cachedSize" in obj && obj["cachedSize"] != null && typeof obj["cachedSize"] !== "number") {
    console.warn("Episode optional 'cachedSize' is invalid", { obj });
    return false;
  }
  if ("cachedEncoding" in obj && obj["cachedEncoding"] != null && !isEncoding(obj["cachedEncoding"])) {
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

  if (!("id" in obj) || typeof obj["id"] !== "string") {
    console.warn("Block missing or invalid 'id'", { obj });
    return false;
  }

  const options = obj["options"];
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

  if (!("id" in obj) || typeof obj["id"] !== "string") return false;
  if (!("date" in obj) || typeof obj["date"] !== "string") return false;
  if (!("description" in obj) || typeof obj["description"] !== "string") return false;
  if (!("dateCreated" in obj) || typeof obj["dateCreated"] !== "number") return false;
  if ("dateModified" in obj && typeof obj["dateModified"] !== "number") return false;
  if (!("optionsRev" in obj) || typeof obj["optionsRev"] !== "number") return false;
  if (!("blockCount" in obj) || typeof obj["blockCount"] !== "number") return false;
  if (!("episodeCount" in obj) || typeof obj["episodeCount"] !== "number") return false;
  if ("exportSize" in obj && typeof obj["exportSize"] !== "number") return false;

  return true;
}

export function isProjectDataOnly(obj: unknown): obj is ProjectData {
  if (!isStandardObject(obj)) {
    console.warn("ProjectData type check: not an object");
    return false;
  }

  if (!("id" in obj) || typeof obj["id"] !== "string") {
    console.warn("ProjectData missing or invalid 'id'", { obj });
    return false;
  }

  const blocks = obj["blocks"];
  if (!Array.isArray(blocks) || !(blocks as unknown[]).every((b) => isBlock(b))) {
    console.warn("ProjectData 'blocks' invalid", { obj });
    return false;
  }

  const episodes = obj["episodes"];
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

  // Check data (blocks & episodes)
  const blocks = obj["blocks"];
  if (!Array.isArray(blocks) || !(blocks as unknown[]).every((b) => isBlock(b))) {
    console.warn("Project 'blocks' invalid", { obj });
    return false;
  }
  const episodes = obj["episodes"];
  if (!Array.isArray(episodes) || !(episodes as unknown[]).every((e) => isEpisode(e))) {
    console.warn("Project 'episodes' invalid", { obj });
    return false;
  }

  // Check meta
  if (!isProjectMetaOnly(obj)) return false;

  return true;
}
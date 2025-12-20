import {
  Block, getEmptyBlock,
  Episode, getEmptyEpisode,
  Project, getEmptyProject,
} from "../types";

const episodeKeys = Object.keys(getEmptyEpisode(""));
const blockKeys = Object.keys(getEmptyBlock());
const projectKeys = Object.keys(getEmptyProject());

export function isEpisode(obj: unknown): obj is Episode {
  if (
    !obj
    || typeof obj !== "object"
    || Array.isArray(obj)
  ) {
    console.warn("Episode type check: does not conform to basic object structure");
    return false;
  }

  if (
    ("id" in obj && typeof obj.id === "string")
    && ("order" in obj && typeof obj.order === "number")
    && ("blockId" in obj && typeof obj.blockId === "string")
    && ("filePath" in obj && (typeof obj.filePath === "string" || obj.filePath === null))
    && ("duration" in obj && (typeof obj.duration === "number" || obj.duration === null))
    && ("cachedStartTime" in obj && (typeof obj.cachedStartTime === "number" || obj.cachedStartTime === null))
    && ("cachedEndTime" in obj && (typeof obj.cachedEndTime === "number" || obj.cachedEndTime === null))
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

  if (
    ("id" in obj && typeof obj.id === "string")
    && ("options" in obj && typeof obj.options === "object" && !Array.isArray(obj.options))
    && ("order" in obj && typeof obj.order === "number")
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

  if (
    ("id" in obj && typeof obj.id === "string")
    && ("date" in obj && typeof obj.date === "string")
    && ("description" in obj && (typeof obj.description === "string" || obj.description === null))
    && ("dateCreated" in obj && typeof obj.dateCreated === "number")
    && ("dateModified" in obj && (typeof obj.dateModified === "number" || obj.dateModified === null))
    && ("optionsRev" in obj && typeof obj.optionsRev === "number")
    && ("blocks" in obj && Array.isArray(obj.blocks) && obj.blocks.every(isBlock))
    && ("episodes" in obj && Array.isArray(obj.episodes) && obj.episodes.every(isEpisode))
  ) {
    return true;
  }

  const missingProps = projectKeys.filter((key) => !(key in obj));
  console.warn("Project type check: missing properties:", missingProps, "What was received:", { ...obj });
  return false;
}
import { DefaultBlockOptions } from "@/consts";
import { blockClips } from "@/global";
import type { Block, BlockClip } from "@/types";

export type BlockPlacement = keyof BlockClip["allowedPlacement"];

export function optionKey(placement: BlockPlacement, clipID: BlockClip["id"]): string {
  return `${placement}__${clipID}`;
}

export function clipsForPlacement(placement: BlockPlacement): BlockClip[] {
  return blockClips.filter(clip => clip.allowedPlacement[placement]);
}

/** Every option in the catalog in display order: leading clips first, then trailing */
export function allOptionEntries(): { key: string; placement: BlockPlacement; clip: BlockClip; }[] {
  return (["leading", "trailing"] as const).flatMap(placement =>
    clipsForPlacement(placement).map(clip => ({
      key: optionKey(placement, clip.id),
      placement,
      clip,
    })),
  );
}

/**
 * Reconciles saved options against the current clip catalog:
 * known keys keep their saved checked state, removed clips drop out,
 * and clips added since the save appear with their `base` state.
 */
export function reconcileBlockOptions(
  saved: Block["options"] | undefined,
  base: Block["options"] = DefaultBlockOptions,
): Block["options"] {
  const result = { ...base };

  if (!saved) return result;
  for (const key of Object.keys(result)) {
    const savedState = saved[key];
    if (typeof savedState === "boolean") {
      result[key] = savedState;
    }
  }

  return result;
}

const UserDefaultOptionsStorageKey = "defaultBlockOptions";

/**
 * The user's preferred options for newly created blocks.
 * Falls back to the clip catalog's built-in defaults.
 */
export function getUserDefaultBlockOptions(): Block["options"] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(UserDefaultOptionsStorageKey);
  }
  catch (e: unknown) {
    console.error("Failed to read default block options from local storage:", e);
  }
  if (!raw) return { ...DefaultBlockOptions };

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
  }
  catch (e: unknown) {
    console.error("Failed to parse stored default block options:", e);
  }
  if (typeof parsed !== "object" || parsed === null) return { ...DefaultBlockOptions };

  const saved: Block["options"] = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === "boolean") saved[key] = value;
  }

  return reconcileBlockOptions(saved);
}

export function setUserDefaultBlockOptions(options: Block["options"]): void {
  localStorage.setItem(UserDefaultOptionsStorageKey, JSON.stringify(reconcileBlockOptions(options)));
}

export function resetUserDefaultBlockOptions(): void {
  localStorage.removeItem(UserDefaultOptionsStorageKey);
}

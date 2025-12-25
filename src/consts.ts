import { blockClips } from "@/global";
import type { BlockClip } from "@/types";

export const DefaultBlockOptions: Record<string, BlockClip["default"]> = {} as const;
for (const clipKey in blockClips) {
  if (!blockClips[clipKey]) continue;
  for (const placement in blockClips[clipKey].allowedPlacement) {
    const optionKey = `${placement}_${clipKey}`;
    DefaultBlockOptions[optionKey] = blockClips[clipKey].default;
  }
}
export type DefaultBlockOptions = typeof DefaultBlockOptions;

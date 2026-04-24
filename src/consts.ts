import { blockClips } from "@/global";
import type { BlockClip } from "@/types";

export const DefaultBlockOptions: Record<string, BlockClip["default"]> = {} as const;
for (const clipKey of blockClips) {
  for (const placement in clipKey.allowedPlacement) {
    const optionKey = `${placement}__${clipKey.id}`;
    DefaultBlockOptions[optionKey] = clipKey.default;
  }
}
export type DefaultBlockOptions = typeof DefaultBlockOptions;

export const Encoding = {
  h264: "h264",
  hevc: "hevc",
} as const;
export type Encoding = typeof Encoding[keyof typeof Encoding] | (string & {});
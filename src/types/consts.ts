export const Encoding = {
  h264: "h264",
  h265: "h265",
} as const;
export type Encoding = typeof Encoding[keyof typeof Encoding] | (string & {});
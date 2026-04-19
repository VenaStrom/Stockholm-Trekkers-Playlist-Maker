import { Command } from "@tauri-apps/plugin-shell";
import type { FFmpegArg } from "@/types/ffmpeg-args.generated";

export type FFmpegOutput = {
  code: number | null;
  signal: number | null;
  stdout: string;
  stderr: string;
};

export async function runFFmpeg(args: ReadonlyArray<FFmpegArg>): Promise<FFmpegOutput> {
  const result = await Command.sidecar("ffmpeg", [...args]).execute();

  if (result.code !== 0) {
    throw new Error(`FFmpeg failed with code ${result.code}: ${result.stderr}`);
  }

  return result;
}
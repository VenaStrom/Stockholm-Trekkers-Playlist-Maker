import { Command } from "@tauri-apps/plugin-shell";

export type FFmpegOutput = {
  code: number | null;
  signal: number | null;
  stdout: string;
  stderr: string;
};

export async function runFFmpeg(args: string[]): Promise<FFmpegOutput> {
  const result = await Command.sidecar("ffmpeg", args).execute();

  if (result.code !== 0) {
    throw new Error(`FFmpeg failed with code ${result.code}: ${result.stderr}`);
  }

  return result;
}

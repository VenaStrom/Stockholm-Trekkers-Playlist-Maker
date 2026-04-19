import { Command } from "@tauri-apps/plugin-shell";
import type { FFmpegArg } from "@/types/ffmpeg-args.generated";

export type FFmpegOutput = {
  code: number | null;
  signal: number | null;
  stdout: string;
  stderr: string;
};

export type FFprobeOutput = FFmpegOutput;

export async function runFFmpeg(args: ReadonlyArray<FFmpegArg>): Promise<FFmpegOutput> {
  const result = await Command.sidecar("binaries/ffmpeg", [...args]).execute();

  if (result.code !== 0) {
    throw new Error(`FFmpeg failed with code ${result.code}: ${result.stderr}`);
  }

  return result;
}

export async function runFFprobe(args: ReadonlyArray<string>): Promise<FFprobeOutput> {
  const result = await Command.sidecar("binaries/ffprobe", [...args]).execute();

  if (result.code !== 0) {
    throw new Error(`FFprobe failed with code ${result.code}: ${result.stderr}`);
  }

  return result;
}
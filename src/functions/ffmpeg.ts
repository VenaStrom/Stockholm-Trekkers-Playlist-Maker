import { Command } from "@tauri-apps/plugin-shell";
import type { FFmpegArg } from "@/types/ffmpeg-args.generated";

export type FFmpegOutput = {
  code: number | null;
  signal: number | null;
  stdout: string;
  stderr: string;
};

export type FFprobeOutput = FFmpegOutput;

async function executeWithFallback(sidecarName: string, commandName: string, args: ReadonlyArray<string>): Promise<FFmpegOutput> {
  try {
    return await Command.sidecar(sidecarName, [...args]).execute();
  } catch {
    return await Command.create(commandName, [...args]).execute();
  }
}

export async function runFFmpeg(args: ReadonlyArray<FFmpegArg>): Promise<FFmpegOutput> {
  const result = await executeWithFallback("binaries/stplay-ffmpeg", "ffmpeg", args);

  if (result.code !== 0) {
    throw new Error(`FFmpeg failed with code ${result.code}: ${result.stderr}`);
  }

  return result;
}

export async function runFFprobe(args: ReadonlyArray<string>): Promise<FFprobeOutput> {
  const result = await executeWithFallback("binaries/stplay-ffprobe", "ffprobe", args);

  if (result.code !== 0) {
    throw new Error(`FFprobe failed with code ${result.code}: ${result.stderr}`);
  }

  return result;
}
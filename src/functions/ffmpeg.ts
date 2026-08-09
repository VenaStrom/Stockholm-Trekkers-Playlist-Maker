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

export type TranscodeTarget = "h264" | "hevc";

const TranscodeVideoArgs: Record<TranscodeTarget, string[]> = {
  h264: ["-c:v", "libx264", "-crf", "20", "-preset", "veryfast"],
  hevc: ["-c:v", "libx265", "-crf", "23", "-preset", "veryfast"],
};

/** Tagged so the caller can tell "the binary didn't start" from "the encode failed" */
class SpawnFailure extends Error {}

/**
 * Re-encodes a media file with ffmpeg: video to the target codec, audio to
 * AAC, subtitles copied. Streams per-file progress (0..1) when the source
 * duration is known, and kills the encoder when the signal aborts.
 */
export async function transcodeFile(options: {
  source: string;
  dest: string;
  target: TranscodeTarget;
  durationSeconds?: number;
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const { source, dest, target, durationSeconds, onProgress, signal } = options;

  const args = [
    "-y",
    "-i", source,
    "-map", "0",
    ...TranscodeVideoArgs[target],
    "-c:a", "aac",
    "-b:a", "192k",
    "-c:s", "copy",
    "-progress", "pipe:1",
    "-nostats",
    "-loglevel", "error",
    dest,
  ];

  const runCommand = (command: Command<string>) =>
    new Promise<void>((resolve, reject) => {
      let stderrTail = "";

      command.stdout.on("data", (line: string) => {
        // -progress emits key=value lines; out_time_ms is in microseconds despite the name
        const match = /out_time_ms=(\d+)/.exec(line);
        if (match && durationSeconds && onProgress) {
          const seconds = Number(match[1]) / 1_000_000;
          onProgress(Math.min(seconds / durationSeconds, 1));
        }
      });
      command.stderr.on("data", (line: string) => {
        stderrTail = `${stderrTail}\n${line}`.slice(-2000);
      });
      command.on("error", (err) => {
        reject(new Error(`FFmpeg errored: ${String(err)}`));
      });
      command.on("close", (data: { code: number | null; }) => {
        if (data.code === 0) resolve();
        else if (signal?.aborted) reject(new Error("Transcode cancelled."));
        else reject(new Error(`FFmpeg exited with code ${data.code}:${stderrTail}`));
      });

      command.spawn()
        .then((child) => {
          const killChild = () => {
            child.kill().catch((err: unknown) => {
              console.error("Failed to kill ffmpeg:", err);
            });
          };
          if (signal?.aborted) killChild();
          else signal?.addEventListener("abort", killChild, { once: true });
        })
        .catch((err: unknown) => {
          reject(new SpawnFailure(String(err)));
        });
    });

  try {
    await runCommand(Command.sidecar("binaries/stplay-ffmpeg", [...args]));
  }
  catch (err) {
    if (!(err instanceof SpawnFailure)) throw err;
    // Sidecar unavailable: fall back to a system ffmpeg
    await runCommand(Command.create("ffmpeg", [...args]));
  }
}
import { chmod, copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

function getTargetTriple(): string {
  const platformArch = `${process.platform}-${process.arch}`;

  switch (platformArch) {
    case "linux-x64":
      return "x86_64-unknown-linux-gnu";
    case "linux-arm64":
      return "aarch64-unknown-linux-gnu";
    case "win32-x64":
      return "x86_64-pc-windows-msvc";
    case "win32-arm64":
      return "aarch64-pc-windows-msvc";
    case "darwin-x64":
      return "x86_64-apple-darwin";
    case "darwin-arm64":
      return "aarch64-apple-darwin";
    default:
      throw new Error(`Unsupported platform/arch for ffmpeg sidecar: ${platformArch}`);
  }
}

async function main(): Promise<void> {
  if (!ffmpegStatic) {
    throw new Error("ffmpeg-static did not resolve a binary path.");
  }
  if (!ffprobeStatic.path) {
    throw new Error("ffprobe-static did not resolve a binary path.");
  }

  const targetTriple = getTargetTriple();
  const extension = process.platform === "win32" ? ".exe" : "";

  const destinationDir = resolve("src-tauri", "binaries");
  const ffmpegDestinationPath = resolve(destinationDir, `ffmpeg-${targetTriple}${extension}`);

  const ffprobeSourcePath = ffprobeStatic.path;
  const ffprobeDestinationPath = resolve(destinationDir, `ffprobe-${targetTriple}${extension}`);

  await mkdir(destinationDir, { recursive: true });
  await copyFile(ffmpegStatic, ffmpegDestinationPath);
  await copyFile(ffprobeSourcePath, ffprobeDestinationPath);

  if (process.platform !== "win32") {
    await chmod(ffmpegDestinationPath, 0o755);
    await chmod(ffprobeDestinationPath, 0o755);
  }

  console.info(`Prepared FFmpeg sidecar for ${targetTriple}`);
  console.info(`Source: ${ffmpegStatic}`);
  console.info(`Destination: ${ffmpegDestinationPath}`);
  console.info(`Prepared FFprobe sidecar for ${targetTriple}`);
  console.info(`Source: ${ffprobeSourcePath}`);
  console.info(`Destination: ${ffprobeDestinationPath}`);
}

await main();

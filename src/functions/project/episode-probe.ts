import { runFFprobe } from "@/functions/ffmpeg";
import type { Encoding, Episode } from "@/types";
import { isEncoding, isStandardObject } from "@/types";

type MediaFileProbeResult = {
  format: { duration: string; size: string };
  streams: { codec_name: Encoding }[];
};
function isMediaFileProbeResult(obj: unknown): obj is MediaFileProbeResult {
  if (typeof obj !== "object" || obj === null) return false;

  if (!("format" in obj) || typeof obj.format !== "object" || obj.format === null) return false;
  if (!("duration" in obj.format) || typeof obj.format.duration !== "string") return false;
  if (!("size" in obj.format) || typeof obj.format.size !== "string") return false;

  if (!("streams" in obj) || !Array.isArray(obj.streams)) return false;
  for (const stream of obj.streams) {
    if (!isStandardObject(stream)) return false;
    if (!("codec_name" in stream) || !isEncoding(stream.codec_name)) return false;
  }

  return true;
}

type EpisodeDefinedPath = Episode & Required<Pick<Episode, "filePath">>;
type ProbedEpisode = Episode
  & Required<Pick<Episode, "filePath">>
  & Required<Pick<Episode, "cachedDuration">>
  & Required<Pick<Episode, "cachedEncoding">>
  & Required<Pick<Episode, "cachedSize">>;

export async function probeEpisode(episode: EpisodeDefinedPath): Promise<ProbedEpisode> {
  const probeResult = await runFFprobe([
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "format=duration,size:stream=codec_name",
    "-of", "json",
    episode.filePath,
  ]);

  let parsed;
  try {
    parsed = JSON.parse(probeResult.stdout) as unknown;
  }
  catch (e: unknown) {
    console.error("Failed to parse FFprobe output:", e, { output: probeResult.stdout });
    throw new Error("Failed to parse FFprobe output");
  }
  if (!isMediaFileProbeResult(parsed)) {
    console.error("FFprobe output does not match expected structure:", { parsed });
    throw new Error("FFprobe output does not match expected structure");
  }

  const firstEncoding = parsed.streams[0]?.codec_name;
  if (!firstEncoding) {
    console.error("No video stream found in FFprobe output:", { parsed });
    throw new Error("No video stream found in the media file");
  }

  return {
    ...episode,
    cachedDuration: parseFloat(parsed.format.duration),
    cachedSize: Number(parsed.format.size),
    cachedEncoding: firstEncoding,
  };
}
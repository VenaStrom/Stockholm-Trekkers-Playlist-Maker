import { runFFprobe } from "@/functions/ffmpeg";
import type { Episode } from "@/types";

export async function probeEpisode(episode: Episode & Required<Pick<Episode, "filePath">>): Promise<
  Episode
  & Required<Pick<Episode, "filePath">>
  & Required<Pick<Episode, "cachedDuration">>
  & Required<Pick<Episode, "cachedEncoding">>
  & Required<Pick<Episode, "cachedSize">>
> {
  const probeResult = await runFFprobe([
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    episode.filePath,
  ]);

  return {};
}
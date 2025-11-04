import { Episode } from "../../project-types";

export default function EpisodeLi({
  episode,
  episodeIndex,
}: {
  episode: Episode;
  episodeIndex: number;
}) {
  return (
    <li className="h-8">
      {episodeIndex + 1}

    </li>
  );
}
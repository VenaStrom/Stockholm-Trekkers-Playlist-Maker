import { Episode, Project } from "../project-types";

export function updateEpisodeInProject(newEpisode: Episode, project: Project, projectSetter: React.Dispatch<React.SetStateAction<Project | null>>) {
  projectSetter((prevProject) => {
    if (!prevProject) return prevProject;

    const updatedBlocks = prevProject.blocks.map((block) => {
      const updatedEpisodes = block.episodes.map((ep) => {
        if (ep.id === newEpisode.id) {
          return { ...newEpisode };
        }
        return ep;
      });
      return { ...block, episodes: updatedEpisodes };
    });

    return { ...prevProject, blocks: updatedBlocks };
  });
}